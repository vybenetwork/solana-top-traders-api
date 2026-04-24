interface TokenData {
  symbol?: string;
  name?: string;
  mintAddress?: string;
  logoUrl?: string;
  decimal?: number;
  decimals?: number;
  category?: string;
  subcategory?: string;
  verified?: boolean;
  price?: number;
  marketCap?: number;
  price1d?: number;
  price7d?: number;
  currentSupply?: number;
  tokenAmountVolume24h?: number;
  usdValueVolume24h?: number;
  updateTime?: number;
}

interface HolderRow {
  rank?: number;
  ownerAddress?: string;
  ownerName?: string;
  balance?: number | string;
  valueUsd?: number;
  percentageOfSupplyHeld?: number;
}

interface TopTraderRow {
  accountAddress?: string;
  accountName?: string;
  metrics?: {
    realizedPnlUsd?: number;
    tradesCount?: number;
    tradesVolumeUsd?: number;
    winRate?: number;
  };
}

type SearchMode = 'token' | 'wallet';

const mintInput = document.getElementById('mint') as HTMLInputElement;
const searchInputLabel = document.getElementById('searchInputLabel') as HTMLElement;
const searchModeLock = document.getElementById('searchModeLock') as HTMLButtonElement;
const searchModeWallet = document.getElementById('searchModeWallet') as HTMLInputElement;
const searchModeSwitchLabel = document.getElementById('searchModeSwitchLabel') as HTMLElement;
const fetchAllBtn = document.getElementById('fetchAll') as HTMLButtonElement;
const loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
const tokenSection = document.getElementById('tokenSection') as HTMLElement;
const tokenSectionLoading = document.getElementById('tokenSectionLoading') as HTMLElement;
const tokenSectionError = document.getElementById('tokenSectionError') as HTMLElement;
const tokenLogo = document.getElementById('tokenLogo') as HTMLImageElement;
const tokenSymbol = document.getElementById('tokenSymbol') as HTMLElement;
const tokenName = document.getElementById('tokenName') as HTMLElement;
const tokenStats = document.getElementById('tokenStats') as HTMLElement;
const topTradersLoading = document.getElementById('topTradersLoading') as HTMLElement;
const topTradersError = document.getElementById('topTradersError') as HTMLElement;
const topTradersMeta = document.getElementById('topTradersMeta') as HTMLElement;
const topTradersBody = document.getElementById('topTradersBody') as HTMLElement;

const SEARCH_MODE_LOCKED_KEY = 'topTradersSearchModeLocked';
const SEARCH_MODE_KEY = 'topTradersSearchMode';
const MAX_FETCH_RETRIES = 5;
const FETCH_RETRY_DELAY_MS = 2000;
const DEMO_MINT = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

function getSearchMode(): SearchMode {
  return localStorage.getItem(SEARCH_MODE_KEY) === 'wallet' ? 'wallet' : 'token';
}

function setSearchMode(mode: SearchMode): void {
  localStorage.setItem(SEARCH_MODE_KEY, mode);
}

function isSearchModeLocked(): boolean {
  return localStorage.getItem(SEARCH_MODE_LOCKED_KEY) !== 'false';
}

function setSearchModeLocked(locked: boolean): void {
  localStorage.setItem(SEARCH_MODE_LOCKED_KEY, locked ? 'true' : 'false');
}

function applySearchModeUI(): void {
  const mode = getSearchMode();
  const tokenMode = mode === 'token';
  const locked = isSearchModeLocked();
  searchModeWallet.checked = !tokenMode;
  searchModeLock.setAttribute('aria-pressed', String(locked));
  searchModeSwitchLabel.classList.toggle('trades-fetch-switch--locked', locked);
  searchModeSwitchLabel.title = locked
    ? 'Locked: mode is fixed. Unlock to switch token/wallet.'
    : 'Switch between token and wallet search.';
  searchInputLabel.textContent = tokenMode ? 'Token mint address' : 'Wallet address or name';
  mintInput.placeholder = tokenMode
    ? 'e.g. DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
    : 'e.g. 7xKXtg2CW4fXh1vM4dfV2Qx9tqGk8hL38Gy4X9Kq8p7y';
  fetchAllBtn.textContent = tokenMode ? 'Load token analytics' : 'Search top traders';
  if (tokenSection) tokenSection.hidden = !tokenMode;
}

function truncateAddress(addr: string | undefined): string {
  if (!addr || addr.length <= 12) return addr ?? '';
  return `${addr.slice(0, 4)}....${addr.slice(-4)}`;
}

function formatNum(n: number | string | null | undefined): string {
  if (n == null) return '—';
  if (typeof n === 'number') {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toFixed(4);
  }
  return String(n);
}

function formatInt(n: number | null | undefined): string {
  if (n == null) return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Math.round(num).toLocaleString();
}

function formatUsdFull(n: number | null | undefined): string {
  if (n == null) return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs < 10) return `$${num.toFixed(2)} USD`;
  return `$${sign}${Math.abs(Math.round(num)).toLocaleString()} USD`;
}

function formatPrice(n: number | null | undefined): string {
  if (n == null) return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  const trim = (s: string) => s.replace(/\.?0+$/, '') || '0';
  if (num >= 1) {
    const s = num.toFixed(2);
    return s.endsWith('.00') ? s.replace(/\.00$/, '') : s;
  }
  if (num > 0.0099) return trim(num.toFixed(4));
  return trim(num.toFixed(12));
}

const tokenSectionIcons: Record<string, string> = {
  overview:
    '<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>',
  price:
    '<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  supply:
    '<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  meta:
    '<svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
};

interface SectionSpec {
  icon: string;
  title: string;
  rows: [string, string | number | undefined][];
}

function showSectionError(el: HTMLElement, msg: string): void {
  el.textContent = msg;
  el.hidden = false;
  el.removeAttribute('aria-hidden');
}

function hideSectionError(el: HTMLElement): void {
  el.textContent = '';
  el.hidden = true;
  el.setAttribute('aria-hidden', 'true');
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if ([502, 503, 504].includes(res.status)) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_FETCH_RETRIES) {
        await new Promise((r) => setTimeout(r, FETCH_RETRY_DELAY_MS));
      }
    }
  }
  throw lastErr;
}

function renderToken(t: TokenData): void {
  tokenLogo.src = t.logoUrl || '';
  tokenLogo.alt = t.symbol || '';
  tokenLogo.style.display = t.logoUrl ? 'block' : 'none';
  tokenSymbol.textContent = t.symbol || '—';
  tokenName.textContent = t.name || t.mintAddress || '—';

  const sectionHtml = (s: SectionSpec): string => `<section class="token-stats-group">
      <h3 class="token-stats-group-title">${s.icon}<span>${s.title}</span></h3>
      <dl class="token-stats">${s.rows.map(([label, value]) => `<dt>${label}</dt><dd>${value ?? '—'}</dd>`).join('')}</dl>
    </section>`;

  const sym = (t.symbol || '').toUpperCase();
  const formatUpdateTime = (ts: number | undefined): string => {
    if (ts == null) return '—';
    const d = new Date(ts * 1000);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const mintLink = t.mintAddress
    ? `<a href="https://vybe.fyi/tokens/${encodeURIComponent(t.mintAddress)}" target="_blank" rel="noopener noreferrer" class="mono" title="${t.mintAddress}">${t.mintAddress}</a>`
    : '—';
  const overview: SectionSpec = {
    icon: tokenSectionIcons.overview,
    title: 'Overview',
    rows: [
      ['Mint', mintLink],
      ['Symbol', sym || '—'],
      ['Decimals', t.decimal ?? t.decimals],
      ['Category', t.category ?? '—'],
      ['Subcategory', t.subcategory ?? '—'],
      ['Verified', t.verified != null ? String(t.verified) : '—'],
    ],
  };
  const priceSection: SectionSpec = {
    icon: tokenSectionIcons.price,
    title: 'Price & market cap',
    rows: [
      ['Price (USD)', t.price != null ? `${formatPrice(t.price)} USD` : '—'],
      ['Market cap', t.marketCap != null ? `${formatNum(t.marketCap)} USD` : '—'],
      ['Price (1d ago)', t.price1d != null ? formatPrice(t.price1d) : '—'],
      ['Price (7d ago)', t.price7d != null ? formatPrice(t.price7d) : '—'],
    ],
  };
  const supplyVolumeSection: SectionSpec = {
    icon: tokenSectionIcons.supply,
    title: 'Supply & volume (24h)',
    rows: [
      ['Current supply', t.currentSupply != null ? `${formatNum(t.currentSupply)}${sym ? ` ${sym}` : ''}` : '—'],
      ['Token volume (24h)', t.tokenAmountVolume24h != null ? `${formatNum(t.tokenAmountVolume24h)}${sym ? ` ${sym}` : ''}` : '—'],
      ['USD volume (24h)', t.usdValueVolume24h != null ? `${formatNum(t.usdValueVolume24h)} USD` : '—'],
    ],
  };
  const metaSection: SectionSpec = {
    icon: tokenSectionIcons.meta,
    title: 'Last updated',
    rows: [['Update time', formatUpdateTime(t.updateTime)]],
  };

  tokenStats.innerHTML =
    sectionHtml(overview) +
    `<div class="token-stats-row"><div class="token-stats-col">${sectionHtml(priceSection)}</div><div class="token-stats-col">${sectionHtml(supplyVolumeSection)}</div></div>` +
    sectionHtml(metaSection);
}

function renderTopTraders(data: { data?: TopTraderRow[] }, mode: SearchMode, query: string): void {
  const list = data.data || [];
  const scope = mode === 'wallet' ? `wallet filter "${query}"` : `token "${query}"`;
  topTradersMeta.textContent = list.length
    ? `Top traders by realized PnL (30d, ${scope}; ${list.length} shown).`
    : '—';
  topTradersBody.innerHTML = list.length
    ? list.map((row, i) => {
      const rank = i + 1;
      const addr = row.accountAddress;
      const display = row.accountName || (addr ? truncateAddress(addr) : '—');
      const accountLink = addr
        ? `<a href="https://vybe.fyi/wallets/${encodeURIComponent(addr)}" target="_blank" rel="noopener noreferrer" class="mono" title="${addr}">${display}</a>`
        : `<span class="mono">${display}</span>`;
      const m = row.metrics || {};
      return `<tr>
        <td>${rank}</td>
        <td>${accountLink}</td>
        <td>${formatUsdFull(m.realizedPnlUsd)}</td>
        <td style="text-align:right">${formatInt(m.tradesCount)}</td>
        <td style="text-align:right">${formatUsdFull(m.tradesVolumeUsd)}</td>
        <td style="text-align:right">${m.winRate != null ? `${Math.round(Number(m.winRate))}%` : '—'}</td>
      </tr>`;
    }).join('')
    : '<tr><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>';
}

async function loadData(): Promise<void> {
  const query = mintInput.value.trim();
  if (!query) return;
  const mode = getSearchMode();
  const tokenMode = mode === 'token';
  const mint = query;

  hideSectionError(tokenSectionError);
  hideSectionError(topTradersError);
  fetchAllBtn.disabled = true;
  loadingIndicator.hidden = false;
  tokenSectionLoading.hidden = tokenMode ? false : true;
  topTradersLoading.hidden = false;

  const topParams = new URLSearchParams({
    resolution: '30d',
    sortByDesc: 'realizedPnlUsd',
    limit: '100',
  });
  if (tokenMode) topParams.set('mintAddress', mint);
  else topParams.set('ilikeFilter', query);

  try {
    let tokenData: TokenData | null = null;
    if (tokenMode) {
      const tokenRes = await fetchWithRetry(`/api/tokens/${encodeURIComponent(mint)}`);
      if (tokenRes.ok) {
        tokenData = (await tokenRes.json()) as TokenData;
        renderToken(tokenData);
      } else {
        showSectionError(tokenSectionError, `Failed (${tokenRes.status})`);
      }
    }

    const topRes = await fetchWithRetry(`/api/wallets/top-traders?${topParams.toString()}`);
    if (topRes.ok) renderTopTraders(await topRes.json() as { data?: TopTraderRow[] }, mode, query);
    else showSectionError(topTradersError, `Failed (${topRes.status})`);
    void tokenData;
  } catch {
    showSectionError(topTradersError, 'Failed');
  } finally {
    fetchAllBtn.disabled = false;
    loadingIndicator.hidden = true;
    tokenSectionLoading.hidden = true;
    topTradersLoading.hidden = true;
  }
}

searchModeLock.addEventListener('click', () => {
  setSearchModeLocked(!isSearchModeLocked());
  applySearchModeUI();
});

searchModeWallet.addEventListener('change', () => {
  if (isSearchModeLocked()) {
    searchModeWallet.checked = getSearchMode() === 'wallet';
    return;
  }
  setSearchMode(searchModeWallet.checked ? 'wallet' : 'token');
  applySearchModeUI();
});

fetchAllBtn.addEventListener('click', () => {
  void loadData();
});

setSearchMode(getSearchMode());
if (!mintInput.value.trim()) mintInput.value = DEMO_MINT;
applySearchModeUI();
