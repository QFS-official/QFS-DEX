# Pull Request Template

## Summary

<!-- Brief description of what this PR changes -->

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] i18n / translations
- [ ] New token contract (must include verified address)
- [ ] New wallet integration

## Checklist

- [ ] Code lints with `bun run lint`
- [ ] Build passes with `bun run build`
- [ ] No `.env`, secrets, or `db/*.db` files committed
- [ ] User-facing strings use `t("key")` from `src/lib/i18n/translations.ts` (both ES + EN)
- [ ] Light + dark themes verified visually
- [ ] Mobile + desktop responsive layouts verified
- [ ] Wallet connection tested (at least the modal opens with all 4 extension wallets + WalletConnect)

## Screenshots / Recordings

<!-- If this PR changes the UI, attach before/after screenshots or a short recording -->

## Testing notes

<!-- How did you test this? What should the reviewer verify? -->
