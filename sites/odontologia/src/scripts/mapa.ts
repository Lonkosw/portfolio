// Carrega o Leaflet só quando o mapa se aproxima da tela.
document.querySelectorAll<HTMLElement>('[data-mapa]').forEach((el) => {
  const iniciar = async () => {
    try {
      const [{ default: L }, { default: css }] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css?url')]);
      if (!document.querySelector('link[data-leaflet]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = css; l.dataset.leaflet = '';
        document.head.appendChild(l);
        await new Promise((ok) => { l.onload = l.onerror = ok; });
      }
      const lat = Number(el.dataset.lat), lng = Number(el.dataset.lng);
      const canvas = el.querySelector<HTMLElement>('[data-canvas]')!;
      const mapa = L.map(canvas, { center: [lat, lng], zoom: 16, scrollWheelZoom: false, attributionControl: true });
      // Tiles: OpenStreetMap por padrão (uso leve). Em produção, defina PUBLIC_MAP_TILES com o
      // endereço de um provedor próprio/pago ({z}/{x}/{y}). No tema escuro o CSS inverte as cores.
      const url = import.meta.env.PUBLIC_MAP_TILES || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      L.tileLayer(url, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);
      L.marker([lat, lng], {
        icon: L.divIcon({ className: 'mapa-pin', html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 14] }),
        keyboard: false,
      }).addTo(mapa);
      el.classList.add('pronto');
    } catch {
      /* mantém o fallback com link */
    }
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); iniciar(); } }, { rootMargin: '300px' });
    io.observe(el);
  } else iniciar();
});
