/**
 * Translation catalog for QFS Swap — Spanish (default) + English.
 * Flat key structure with dot notation for easy lookups: t("header.brand.badge")
 */

export type Lang = "es" | "en";

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "es", label: "Español", short: "ES" },
  { id: "en", label: "English", short: "EN" },
];

type Dict = Record<string, string>;

const es: Dict = {
  // ─── Header ────────────────────────────────────────────────────────────
  "header.brand.badge": "Bridge",
  "header.nav.swap": "Swap",
  "header.nav.usdc": "USDC",
  "header.nav.explorer": "Explorer",
  "header.wallet.connect": "Conectar wallet",
  "header.wallet.connected": "Conectado como {address}",
  "header.wallet.connecting": "Conectando…",
  "header.theme.toggle": "Cambiar tema",
  "header.language.toggle": "Cambiar idioma",

  // ─── Mode tabs ─────────────────────────────────────────────────────────
  "mode.swap": "Swap",
  "mode.dca": "DCA",
  "mode.bridge": "Bridge",
  "mode.airdrop": "Airdrop",

  // ─── Subtitles (per mode) ─────────────────────────────────────────────
  "subtitle.swap": "Swap entre tokens",
  "subtitle.swap.desc": "Mejor precio vía QFS Routing en 400+ DEXs y 30+ redes.",
  "subtitle.dca": "Compra programada (DCA)",
  "subtitle.dca.desc": "Configura compras recurrentes automáticas.",
  "subtitle.bridge": "Bridge cross-chain",
  "subtitle.bridge.desc": "Transfiere activos entre BNB, Polygon, Solana y Ethereum.",
  "subtitle.airdrop": "Airdrop masivo de tokens",
  "subtitle.airdrop.desc": "Distribuye tokens a múltiples destinatarios en una sola transacción.",
  "subtitle.connected": "Conectado a {chain}.",

  // ─── Swap card ─────────────────────────────────────────────────────────
  "swap.title": "Swap",
  "swap.network": "Red",
  "swap.settings.title": "Configuración",
  "swap.pasteCA": "Pegar dirección del contrato",
  "swap.chartView": "Vista de lista / gráfico",
  "swap.star.add": "Añadir a favoritos",
  "swap.star.remove": "Quitar de favoritos",
  "swap.from": "De",
  "swap.to": "A",
  "swap.notConnected": "No conectado",
  "swap.max": "Max",
  "swap.cta.invalid": "Selecciona un token diferente",
  "swap.cta.solana": "Solana requiere Phantom Wallet",
  "swap.cta.connect": "Conectar billetera",
  "swap.cta.switchChain": "Cambiar a {chain}",
  "swap.cta.enterAmount": "Ingresa un monto",
  "swap.cta.swap": "Swap",
  "swap.cta.processing": "Procesando…",
  "swap.cta.bridging": "Bridging…",
  "swap.routeSent": "Swap enviado",
  "swap.route.route": "Bridge route",
  "swap.route.time": "Tiempo estimado",
  "swap.route.fee": "Fee de red",
  "swap.route.slippage": "Tolerancia slippage",
  "swap.route.rate": "Ratio",
  "swap.route.total": "Total",
  "swap.route.autoRoute": "auto-ruta",
  "swap.settings.slippage": "Tolerancia de slippage",

  // ─── Token picker ─────────────────────────────────────────────────────
  "picker.title.pay": "Selecciona el token para pagar",
  "picker.title.receive": "Selecciona el token para recibir",
  "picker.subtitle": "{count} tokens disponibles",
  "picker.search.placeholder": "Buscar por nombre o dirección…",
  "picker.search.label": "Buscar token",
  "picker.pasteCA": "Pega la CA",
  "picker.network": "Selecciona la red:",
  "picker.filter.favorites": "Favoritos",
  "picker.filter.all": "Todas",
  "picker.filter.grid": "Vista en cuadrícula",
  "picker.filter.list": "Vista en lista",
  "picker.filter.more": "Más redes",
  "picker.list.populares": "Populares",
  "picker.list.price": "Precio",
  "picker.empty.noResults": "No se encontraron tokens para \"{query}\"",
  "picker.empty.clear": "Limpiar búsqueda",
  "picker.verified": "Contrato verificado",
  "picker.close": "Cerrar",

  // ─── Wallet modal ─────────────────────────────────────────────────────
  "walletModal.title": "Conectar wallet",
  "walletModal.description": "Elige cómo quieres conectarte",
  "walletModal.installed": "Detectada",
  "walletModal.notInstalled": "No instalada — abre el instalador",
  "walletModal.disclaimer":
    "Al conectar, aceptas los Términos de Servicio. Tu wallet mantiene el control de tus claves — QFS Swap nunca custodia tus fondos.",
  "walletModal.noWallet": "¿No ves tu wallet?",
  "walletModal.install": "Instalar {name}",
  "walletModal.divider.qr": "O conecta vía QR",

  // ─── WalletConnect QR modal ───────────────────────────────────────────
  "wc.title": "Escanear con WalletConnect",
  "wc.description": "Abre la app de tu wallet y escanea el QR",
  "wc.simulating": "Simulando escaneo en {seconds}s…",
  "wc.simulate": "Simular escaneo exitoso",
  "wc.demo":
    "Modo demo: el QR se genera localmente y no conecta con el relay real. En producción, inicializa @walletconnect/ethereum-provider con un projectId real.",
  "wc.download": "No tienes wallet? Descarga una",
  "wc.openIn": "Abre tu wallet en {device}",
  "wc.downloadCta": "Descargar wallet",
  "wc.cancel": "Cancelar y elegir otra wallet",

  // ─── Swap history ──────────────────────────────────────────────────────
  "history.title": "Swaps recientes",
  "history.empty.title": "Aún no has hecho swaps.",
  "history.empty.desc": "Tu historial aparecerá aquí.",
  "history.clear": "Borrar historial",
  "history.clearConfirm": "¿Borrar todo el historial de swaps?",
  "history.clear.confirm": "Limpiar",
  "history.status.completed": "Completado",
  "history.status.pending": "Pendiente",
  "history.status.failed": "Fallido",
  "history.record.singular": "registro",
  "history.record.plural": "registros",
  "history.ago.seconds": "hace segundos",
  "history.ago.minutes": "hace {count} min",
  "history.ago.hours": "hace {count} h",
  "history.ago.days": "hace {count} d",
  "history.ago.months": "hace {count} m",
  "history.viewOnExplorer": "Ver en el explorador",

  // ─── Favorites ─────────────────────────────────────────────────────────
  "favorites.title": "Pares favoritos",
  "favorites.empty": "Pulsa ★ para guardar pares frecuentes.",
  "favorites.remove": "Quitar {pair} de favoritos",
  "favorites.addCurrent": "Añadir par actual a favoritos",

  // ─── Price chart ──────────────────────────────────────────────────────
  "chart.badge": "QFS",
  "chart.min": "Mín 24h",
  "chart.max": "Máx 24h",
  "chart.volatility": "Volatilidad",
  "chart.by": "por 1 {symbol}",
  "chart.empty": "Selecciona un par para ver el gráfico",

  // ─── Marketing panel (Swap mode) ───────────────────────────────────────
  "marketing.swap.badge": "QFS Routing",
  "marketing.swap.title": "Swapea con el mejor precio",
  "marketing.swap.title.highlight": "mejor precio",
  "marketing.swap.desc":
    "Elige libremente entre las rutas de los principales agregadores DEX. QFS Routing busca las mejores cotizaciones en más de 400 DEXs y 30 redes, con protección MEV y ejecución óptima.",
  "marketing.integrated": "Integrado con",
  "marketing.explore": "Explora los mercados disponibles",
  "marketing.audited": "Audited by",
  "marketing.mev": "MEV protection",

  // ─── Marketing panel (Bridge mode) ────────────────────────────────────
  "marketing.bridge.badge": "QFS Swap Bridge",
  "marketing.bridge.title": "Mueve activos",
  "marketing.bridge.title.highlight": "entre redes",
  "marketing.bridge.desc":
    "QFS Swap transfiere tokens nativos y wrapped entre BNB Chain, Polygon, Solana y Ethereum usando el protocolo Wormhole. Sin custodia, con hasta 5 confirmaciones de seguridad.",
  "marketing.bridge.volume": "Volumen total",
  "marketing.bridge.networks": "Redes",
  "marketing.bridge.time": "Tiempo medio",

  // ─── Footer ────────────────────────────────────────────────────────────
  "footer.powered": "Powered by QFS Swap — Wormhole cross-chain protocol",
  "footer.networks": "Supported networks",
  "footer.docs": "Docs",

  // ─── Mode tabs (Populares / Recientes) for QR modal mobile wallets ────
  "mobile.populares": "Populares",
  "mobile.recientes": "Recientes",
  "mobile.recent.empty.title": "Aún no abriste ninguna wallet.",
  "mobile.recent.empty.desc": "Las wallets que abras se listarán aquí.",
  "mobile.viewAll": "Ver populares",
  "mobile.clear": "Limpiar",
  "mobile.device.ios": "iOS",
  "mobile.device.android": "Android",
  "mobile.device.desktop.desc": "No tienes wallet? Descarga una",
  "mobile.device.ios.desc": "Abre tu wallet en iOS",
  "mobile.device.android.desc": "Abre tu wallet en Android",
  "mobile.simulating": "Simulando escaneo en {seconds}s…",
  "mobile.noResults": "No se encontraron wallets para \"{query}\"",

  // ─── Toasts ──────────────────────────────────────────────────────────
  "toast.invalid.title": "Par inválido",
  "toast.invalid.desc": "Elige tokens diferentes para swap.",
  "toast.solana.title": "Solana no soportada",
  "toast.solana.desc": "Para Solana, instala Phantom Wallet.",
  "toast.switchFail.title": "No se pudo cambiar de red",
  "toast.switchFail.desc": "Cambia tu wallet a {chain} manualmente.",
  "toast.swap.title": "Swap enviado",
  "toast.pasteCA.title": "Pegar CA",
  "toast.pasteCA.desc": "Pega la dirección del contrato del token.",
  "toast.clipboardEmpty.title": "Portapapeles vacío",
  "toast.clipboardEmpty.desc": "Copia una dirección de contrato primero.",
  "toast.pasted.title": "Dirección pegada",
  "toast.view.title": "Vista",
  "toast.view.desc": "Cambia entre vista de lista y gráfico.",
  "toast.moreNetworks.title": "Más redes",
  "toast.moreNetworks.desc": "Próximamente: Avalanche, Arbitrum, Base, Optimism, etc.",
  "toast.clipboardFail.title": "No se pudo leer el portapapeles",
  "toast.clipboardFail.desc": "Permite el acceso o pega la dirección manualmente.",

  // ─── Coming soon (DCA) ────────────────────────────────────────────────
  "dca.comingSoon": "DCA — próximamente",
  "dca.comingSoon.desc":
    "Estamos trabajando en esta función. Mientras tanto, usa Swap para operar en la misma red o Bridge para mover activos entre cadenas.",

  // ─── Airdrop card ──────────────────────────────────────────────────────
  "airdrop.title": "Airdrop",
  "airdrop.network": "Red",
  "airdrop.token": "Token",
  "airdrop.amountPerRecipient": "Cantidad por destinatario",
  "airdrop.recipients": "Destinatarios",
  "airdrop.recipients.placeholder": "Pega las direcciones separadas por coma o una por línea…",
  "airdrop.recipients.valid": "{count} direcciones válidas",
  "airdrop.recipients.invalid": "{count} inválidas omitidas",
  "airdrop.recipients.empty": "Ingresa al menos una dirección",
  "airdrop.pasteCA": "Pegar desde portapapeles",
  "airdrop.clear": "Limpiar",
  "airdrop.total.recipients": "Destinatarios",
  "airdrop.total.amount": "Total a enviar",
  "airdrop.total.gas": "Gas estimado",
  "airdrop.total.networkFee": "Fee de red",
  "airdrop.cta.noRecipients": "Ingresa al menos una dirección",
  "airdrop.cta.enterAmount": "Ingresa el monto por destinatario",
  "airdrop.cta.solana": "Solana requiere Phantom Wallet",
  "airdrop.cta.connect": "Conectar billetera",
  "airdrop.cta.switchChain": "Cambiar a {chain}",
  "airdrop.cta.send": "Enviar Airdrop",
  "airdrop.cta.processing": "Procesando…",
  "airdrop.sent": "Airdrop enviado a {count} destinatarios",
  "airdrop.distribution": "Distribución",
  "airdrop.distribution.perRecipient": "por destinatario",
  "airdrop.distribution.to": "a",
  "airdrop.distribution.recipients": "destinatarios",
  "airdrop.warning.solana":
    "Solana no es accesible desde MetaMask o Coinbase Wallet. Instala Phantom Wallet para airdrops en Solana.",

  // ─── Marketing panel (Airdrop mode) ───────────────────────────────────
  "marketing.airdrop.badge": "QFS Airdrop",
  "marketing.airdrop.title": "Distribuye a",
  "marketing.airdrop.title.highlight": "miles de wallets",
  "marketing.airdrop.desc":
    "Envía tokens a múltiples destinatarios en una sola transacción on-chain. Soporta Ethereum, BNB Chain, Polygon y Solana. Cómputo local de destinatarios válidos y estimación de gas antes del envío.",
  "marketing.airdrop.features": "Características",
  "marketing.airdrop.feature.csv": "Importa direcciones por CSV o texto pegado",
  "marketing.airdrop.feature.multichain": "Soporta ETH, BNB, Polygon y Solana",
  "marketing.airdrop.feature.batch": "Hasta 500 destinatarios por transacción",
  "marketing.airdrop.feature.estimate": "Estimación de gas en vivo",
  "marketing.airdrop.volume": "Airdrops enviados",
  "marketing.airdrop.wallets": "Wallets alcanzadas",

  // ─── Bridge card (Portal-style) ──────────────────────────────────────
  "bridge.from": "From",
  "bridge.to": "To",
  "bridge.connectSource": "Connect source wallet",
  "bridge.swap": "Swap",
  "bridge.solana.warning":
    "Solana no es accesible desde MetaMask o Coinbase Wallet. Instala Phantom Wallet para swaps en Solana.",
  "bridge.phantom": "Phantom Wallet",
  "bridge.help.solana": "MetaMask y Coinbase Wallet conectan BNB Chain, Polygon y Ethereum. Para Solana, instala",
};

const en: Dict = {
  // ─── Header ────────────────────────────────────────────────────────────
  "header.brand.badge": "Bridge",
  "header.nav.swap": "Swap",
  "header.nav.usdc": "USDC",
  "header.nav.explorer": "Explorer",
  "header.wallet.connect": "Connect wallet",
  "header.wallet.connected": "Connected as {address}",
  "header.wallet.connecting": "Connecting…",
  "header.theme.toggle": "Toggle theme",
  "header.language.toggle": "Change language",

  // ─── Mode tabs ─────────────────────────────────────────────────────────
  "mode.swap": "Swap",
  "mode.dca": "DCA",
  "mode.bridge": "Bridge",
  "mode.airdrop": "Airdrop",

  // ─── Subtitles ────────────────────────────────────────────────────────
  "subtitle.swap": "Swap between tokens",
  "subtitle.swap.desc": "Best price via QFS Routing across 400+ DEXs and 30+ networks.",
  "subtitle.dca": "Dollar-cost averaging",
  "subtitle.dca.desc": "Set up automatic recurring buys.",
  "subtitle.bridge": "Cross-chain bridge",
  "subtitle.bridge.desc": "Move assets across BNB, Polygon, Solana, and Ethereum.",
  "subtitle.airdrop": "Mass token airdrop",
  "subtitle.airdrop.desc": "Distribute tokens to multiple recipients in a single on-chain transaction.",
  "subtitle.connected": "Connected to {chain}.",

  // ─── Swap card ─────────────────────────────────────────────────────────
  "swap.title": "Swap",
  "swap.network": "Network",
  "swap.settings.title": "Settings",
  "swap.pasteCA": "Paste contract address",
  "swap.chartView": "List / chart view",
  "swap.star.add": "Add to favorites",
  "swap.star.remove": "Remove from favorites",
  "swap.from": "From",
  "swap.to": "To",
  "swap.notConnected": "Not connected",
  "swap.max": "Max",
  "swap.cta.invalid": "Select a different token",
  "swap.cta.solana": "Solana requires Phantom Wallet",
  "swap.cta.connect": "Connect wallet",
  "swap.cta.switchChain": "Switch to {chain}",
  "swap.cta.enterAmount": "Enter an amount",
  "swap.cta.swap": "Swap",
  "swap.cta.processing": "Processing…",
  "swap.cta.bridging": "Bridging…",
  "swap.routeSent": "Swap submitted",
  "swap.route.route": "Bridge route",
  "swap.route.time": "Estimated time",
  "swap.route.fee": "Network fee",
  "swap.route.slippage": "Slippage tolerance",
  "swap.route.rate": "Rate",
  "swap.route.total": "Total",
  "swap.route.autoRoute": "auto-routed",
  "swap.settings.slippage": "Slippage tolerance",

  // ─── Token picker ─────────────────────────────────────────────────────
  "picker.title.pay": "Select token to pay",
  "picker.title.receive": "Select token to receive",
  "picker.subtitle": "{count} tokens available",
  "picker.search.placeholder": "Search by name or address…",
  "picker.search.label": "Search token",
  "picker.pasteCA": "Paste CA",
  "picker.network": "Select network:",
  "picker.filter.favorites": "Favorites",
  "picker.filter.all": "All",
  "picker.filter.grid": "Grid view",
  "picker.filter.list": "List view",
  "picker.filter.more": "More networks",
  "picker.list.populares": "Popular",
  "picker.list.price": "Price",
  "picker.empty.noResults": "No tokens found for \"{query}\"",
  "picker.empty.clear": "Clear search",
  "picker.verified": "Verified contract",
  "picker.close": "Close",

  // ─── Wallet modal ─────────────────────────────────────────────────────
  "walletModal.title": "Connect a wallet",
  "walletModal.description": "Choose how you want to connect",
  "walletModal.installed": "Detected",
  "walletModal.notInstalled": "Not installed — launch installer",
  "walletModal.disclaimer":
    "By connecting, you agree to the Terms of Service. Your wallet stays in control of your keys — QFS Swap never holds custody of your funds.",
  "walletModal.noWallet": "Don't see your wallet?",
  "walletModal.install": "Install {name}",
  "walletModal.divider.qr": "Or connect via QR",

  // ─── WalletConnect QR modal ───────────────────────────────────────────
  "wc.title": "Scan with WalletConnect",
  "wc.description": "Open your wallet app and scan the QR",
  "wc.simulating": "Simulating scan in {seconds}s…",
  "wc.simulate": "Simulate successful scan",
  "wc.demo":
    "Demo mode: the QR is generated locally and does not connect to the real relay. In production, initialize @walletconnect/ethereum-provider with a real projectId.",
  "wc.download": "No wallet? Download one",
  "wc.openIn": "Open your wallet on {device}",
  "wc.downloadCta": "Download wallet",
  "wc.cancel": "Cancel and pick another wallet",

  // ─── Swap history ──────────────────────────────────────────────────────
  "history.title": "Recent swaps",
  "history.empty.title": "You haven't made any swaps yet.",
  "history.empty.desc": "Your history will appear here.",
  "history.clear": "Clear history",
  "history.clearConfirm": "Clear all swap history?",
  "history.clear.confirm": "Clear",
  "history.status.completed": "Completed",
  "history.status.pending": "Pending",
  "history.status.failed": "Failed",
  "history.record.singular": "record",
  "history.record.plural": "records",
  "history.ago.seconds": "seconds ago",
  "history.ago.minutes": "{count} min ago",
  "history.ago.hours": "{count} h ago",
  "history.ago.days": "{count} d ago",
  "history.ago.months": "{count} mo ago",
  "history.viewOnExplorer": "View on explorer",

  // ─── Favorites ─────────────────────────────────────────────────────────
  "favorites.title": "Favorite pairs",
  "favorites.empty": "Press ★ to save frequent pairs.",
  "favorites.remove": "Remove {pair} from favorites",
  "favorites.addCurrent": "Add current pair to favorites",

  // ─── Price chart ──────────────────────────────────────────────────────
  "chart.badge": "QFS",
  "chart.min": "24h low",
  "chart.max": "24h high",
  "chart.volatility": "Volatility",
  "chart.by": "per 1 {symbol}",
  "chart.empty": "Select a pair to view chart",

  // ─── Marketing panel (Swap mode) ───────────────────────────────────────
  "marketing.swap.badge": "QFS Routing",
  "marketing.swap.title": "Swap at the",
  "marketing.swap.title.highlight": "best price",
  "marketing.swap.desc":
    "Choose freely from the routes of major DEX aggregators. QFS Routing finds the best quotes across 400+ DEXs and 30 networks, with MEV protection and optimal execution.",
  "marketing.integrated": "Integrated with",
  "marketing.explore": "Explore available markets",
  "marketing.audited": "Audited by",
  "marketing.mev": "MEV protection",

  // ─── Marketing panel (Bridge mode) ────────────────────────────────────
  "marketing.bridge.badge": "QFS Swap Bridge",
  "marketing.bridge.title": "Move assets",
  "marketing.bridge.title.highlight": "across networks",
  "marketing.bridge.desc":
    "QFS Swap transfers native and wrapped tokens across BNB Chain, Polygon, Solana, and Ethereum using the Wormhole protocol. Non-custodial, with up to 5 security confirmations.",
  "marketing.bridge.volume": "Total volume",
  "marketing.bridge.networks": "Networks",
  "marketing.bridge.time": "Avg time",

  // ─── Footer ────────────────────────────────────────────────────────────
  "footer.powered": "Powered by QFS Swap — Wormhole cross-chain protocol",
  "footer.networks": "Supported networks",
  "footer.docs": "Docs",

  // ─── Mobile wallets tabs ──────────────────────────────────────────────
  "mobile.populares": "Popular",
  "mobile.recientes": "Recent",
  "mobile.recent.empty.title": "You haven't opened any wallet yet.",
  "mobile.recent.empty.desc": "Wallets you open will be listed here.",
  "mobile.viewAll": "View popular",
  "mobile.clear": "Clear",
  "mobile.device.ios": "iOS",
  "mobile.device.android": "Android",
  "mobile.device.desktop.desc": "No wallet? Download one",
  "mobile.device.ios.desc": "Open your wallet on iOS",
  "mobile.device.android.desc": "Open your wallet on Android",
  "mobile.simulating": "Simulating scan in {seconds}s…",
  "mobile.noResults": "No wallets found for \"{query}\"",

  // ─── Toasts ──────────────────────────────────────────────────────────
  "toast.invalid.title": "Invalid pair",
  "toast.invalid.desc": "Pick different tokens to swap.",
  "toast.solana.title": "Solana not supported",
  "toast.solana.desc": "Install Phantom Wallet for Solana.",
  "toast.switchFail.title": "Couldn't switch network",
  "toast.switchFail.desc": "Switch your wallet to {chain} manually.",
  "toast.swap.title": "Swap submitted",
  "toast.pasteCA.title": "Paste CA",
  "toast.pasteCA.desc": "Paste the token contract address.",
  "toast.clipboardEmpty.title": "Clipboard empty",
  "toast.clipboardEmpty.desc": "Copy a contract address first.",
  "toast.pasted.title": "Address pasted",
  "toast.view.title": "View",
  "toast.view.desc": "Switch between list and chart view.",
  "toast.moreNetworks.title": "More networks",
  "toast.moreNetworks.desc": "Coming soon: Avalanche, Arbitrum, Base, Optimism, etc.",
  "toast.clipboardFail.title": "Couldn't read clipboard",
  "toast.clipboardFail.desc": "Allow access or paste the address manually.",

  // ─── Coming soon (DCA) ────────────────────────────────────────────────
  "dca.comingSoon": "DCA — coming soon",
  "dca.comingSoon.desc":
    "We're working on this feature. Meanwhile, use Swap to trade on the same network or Bridge to move assets across chains.",

  // ─── Airdrop card ──────────────────────────────────────────────────────
  "airdrop.title": "Airdrop",
  "airdrop.network": "Network",
  "airdrop.token": "Token",
  "airdrop.amountPerRecipient": "Amount per recipient",
  "airdrop.recipients": "Recipients",
  "airdrop.recipients.placeholder": "Paste addresses separated by comma or one per line…",
  "airdrop.recipients.valid": "{count} valid addresses",
  "airdrop.recipients.invalid": "{count} invalid skipped",
  "airdrop.recipients.empty": "Enter at least one address",
  "airdrop.pasteCA": "Paste from clipboard",
  "airdrop.clear": "Clear",
  "airdrop.total.recipients": "Recipients",
  "airdrop.total.amount": "Total to send",
  "airdrop.total.gas": "Estimated gas",
  "airdrop.total.networkFee": "Network fee",
  "airdrop.cta.noRecipients": "Enter at least one address",
  "airdrop.cta.enterAmount": "Enter the amount per recipient",
  "airdrop.cta.solana": "Solana requires Phantom Wallet",
  "airdrop.cta.connect": "Connect wallet",
  "airdrop.cta.switchChain": "Switch to {chain}",
  "airdrop.cta.send": "Send Airdrop",
  "airdrop.cta.processing": "Processing…",
  "airdrop.sent": "Airdrop sent to {count} recipients",
  "airdrop.distribution": "Distribution",
  "airdrop.distribution.perRecipient": "per recipient",
  "airdrop.distribution.to": "to",
  "airdrop.distribution.recipients": "recipients",
  "airdrop.warning.solana":
    "Solana is not reachable from MetaMask or Coinbase Wallet. Install Phantom Wallet for Solana airdrops.",

  // ─── Marketing panel (Airdrop mode) ───────────────────────────────────
  "marketing.airdrop.badge": "QFS Airdrop",
  "marketing.airdrop.title": "Distribute to",
  "marketing.airdrop.title.highlight": "thousands of wallets",
  "marketing.airdrop.desc":
    "Send tokens to multiple recipients in a single on-chain transaction. Supports Ethereum, BNB Chain, Polygon, and Solana. Local validation of recipients and live gas estimation before sending.",
  "marketing.airdrop.features": "Features",
  "marketing.airdrop.feature.csv": "Import addresses via CSV or pasted text",
  "marketing.airdrop.feature.multichain": "Supports ETH, BNB, Polygon, and Solana",
  "marketing.airdrop.feature.batch": "Up to 500 recipients per transaction",
  "marketing.airdrop.feature.estimate": "Live gas estimation",
  "marketing.airdrop.volume": "Airdrops sent",
  "marketing.airdrop.wallets": "Wallets reached",

  // ─── Bridge card ──────────────────────────────────────────────────────
  "bridge.from": "From",
  "bridge.to": "To",
  "bridge.connectSource": "Connect source wallet",
  "bridge.swap": "Swap",
  "bridge.solana.warning":
    "Solana is not reachable from MetaMask or Coinbase Wallet. Install Phantom Wallet for Solana swaps.",
  "bridge.phantom": "Phantom Wallet",
  "bridge.help.solana": "MetaMask and Coinbase Wallet connect to BNB Chain, Polygon, and Ethereum. For Solana, install",
};

export const translations: Record<Lang, Dict> = { es, en };

/**
 * Lookup a translation key with optional {param} interpolation.
 * Falls back to the key itself if missing.
 */
export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = translations[lang] ?? translations.es;
  let str = dict[key] ?? translations.es[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}
