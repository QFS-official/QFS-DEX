#!/usr/bin/env python3
"""
Sube secrets al GitHub repo usando la API.
Requiere: pynacl  (pip3 install pynacl)

Uso:
  pip3 install pynacl
  export GH_TOKEN=ghp_xxx
  export VERCEL_TOKEN=vcp_xxx
  export VERCEL_ORG_ID=team_xxx
  export VERCEL_PROJECT_ID=prj_xxx
  python3 set-github-secrets.py [OWNER] [REPO]

Defaults: OWNER=QFS-official, REPO=QFS-DEX
"""
import sys
import os
import json
import base64
import urllib.request
from nacl import public

OWNER = sys.argv[1] if len(sys.argv) > 1 else "QFS-official"
REPO = sys.argv[2] if len(sys.argv) > 2 else "QFS-DEX"

GITHUB_TOKEN = os.environ["GH_TOKEN"]
VERCEL_TOKEN = os.environ["VERCEL_TOKEN"]
VERCEL_ORG_ID = os.environ["VERCEL_ORG_ID"]
VERCEL_PROJECT_ID = os.environ["VERCEL_PROJECT_ID"]

def github_request(method, path, body=None):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, method=method, data=data)
    req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read()) if r.status != 204 else {}
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def get_repo_public_key():
    status, data = github_request("GET", "actions/secrets/public-key")
    if status != 200:
        raise RuntimeError(f"Failed to get repo public key ({status}): {data}")
    return data["key_id"], base64.b64decode(data["key"])

def encrypt_secret(public_key_bytes, secret_value):
    """Encrypt a secret value with libsodium sealed box (crypto_box_seal).
    public_key_bytes is the raw 32-byte key (already decoded from base64)."""
    pub_key = public.PublicKey(public_key_bytes)
    box = public.SealedBox(pub_key)
    encrypted = box.encrypt(secret_value.encode("utf-8"))
    return base64.b64encode(encrypted).decode("utf-8")

def put_secret(secret_name, secret_value, key_id, public_key_bytes):
    encrypted = encrypt_secret(public_key_bytes, secret_value)
    body = {"encrypted_value": encrypted, "key_id": key_id}
    status, data = github_request("PUT", f"actions/secrets/{secret_name}", body)
    return status, data

def main():
    print(f"📦 Fetching repo public key for {OWNER}/{REPO}...")
    key_id, public_key_bytes = get_repo_public_key()
    print(f"   ✓ key_id={key_id}")
    print()

    secrets = [
        ("VERCEL_TOKEN",        VERCEL_TOKEN),
        ("VERCEL_ORG_ID",       VERCEL_ORG_ID),
        ("VERCEL_PROJECT_ID",   VERCEL_PROJECT_ID),
        ("DATABASE_URL",        os.environ.get("DATABASE_URL", "file:/tmp/qfs-dev.db")),
    ]

    for name, value in secrets:
        masked = value if name == "DATABASE_URL" else (value[:8] + "…" + value[-4:])
        print(f"🔐 Setting secret {name} = {masked}")
        status, data = put_secret(name, value, key_id, public_key_bytes)
        if status in (201, 204):
            print(f"   ✓ uploaded ({status})")
        else:
            print(f"   ✗ failed ({status}): {data}")
        print()

    print("📋 Listing all repo secrets:")
    status, data = github_request("GET", "actions/secrets")
    if status == 200:
        for s in data.get("secrets", []):
            print(f"   - {s['name']} (created {s.get('created_at', '?')})")
    else:
        print(f"   ✗ list failed ({status}): {data}")

if __name__ == "__main__":
    main()
