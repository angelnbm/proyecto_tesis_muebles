import React, { useEffect, useRef } from 'react'
import '../styles/landing.css'

const landingMarkup = `
<header class="nav" data-screen-label="Nav">
  <div class="shell nav__inner">
    <a href="#" class="brand">
      <span class="brand__mark"></span>
      TABLÓN
    </a>
    <nav class="nav__links">
      <a href="#producto">Producto</a>
      <a href="#cubicacion">Cubicación</a>
      <a href="#biblioteca">Biblioteca</a>
      <a href="#precios">Precios</a>
      <a href="#docs">Docs</a>
    </nav>
    <div class="nav__cta">
      <a href="#" class="btn" data-login="true" style="font-size:14px;color:var(--color-paper-grey);padding:8px 12px">Ingresar</a>
      <a href="#cta" class="btn btn--primary" data-login="true" style="padding:8px 14px">Probar gratis</a>
    </div>
  </div>
</header>

<section class="hero" data-screen-label="Hero">
  <div class="hero__grid"></div>
  <div class="shell hero__inner">
    <div class="hero__eyebrow">
      <span class="dot"></span>
      <span>v2.4 — diseño + cubicación en una sola mesa</span>
    </div>

    <h1>
      <span class="ink">Diseña el</span><br/>
      <span class="ink">mueble.</span> <span class="accent">Calcula</span><br/>
      <span class="ink">el </span><span class="strike">material</span><span class="ink">.</span>
    </h1>

    <p class="hero__sub">
      Tablón es la mesa de trabajo digital para carpinteros y diseñadores de mobiliario. Bocetea estantes, cajoneras y modulares por arrastre, y obtén al instante la cubicación óptima de planchas con menor desperdicio.
    </p>

    <div class="hero__cta">
      <a href="#cta" class="btn btn--primary" data-login="true">Empezar a diseñar →</a>
      <a href="#producto" class="btn btn--outline">Ver el producto</a>
    </div>

    <div class="hero__meta">
      <span><strong>+12,400</strong> piezas cubicadas esta semana</span>
      <span style="color:var(--color-slate-border)">|</span>
      <span><strong>81.1%</strong> utilización promedio de plancha</span>
      <span style="color:var(--color-slate-border)">|</span>
      <span><strong>0</strong> instalación · navegador</span>
    </div>

    <div id="producto" style="margin-top:64px" data-screen-label="Product preview">
      <div class="window">
        <div class="window__chrome">
          <div class="window__dots">
            <div class="window__dot"></div>
            <div class="window__dot"></div>
            <div class="window__dot"></div>
          </div>
          <div class="window__addr">app.tablon.studio / proyecto · 1234</div>
          <div style="width:60px"></div>
        </div>
        <div class="window__body" id="appBody">
          <aside class="app-side">
            <div class="app-side__user">
              Usuario:
              <strong>angel</strong>
            </div>
            <div class="app-side__signout">Cerrar<br/>sesión</div>
            <div class="app-side__items">
              <div class="app-side__item"><div class="thumb estante"></div><span>Estante</span></div>
              <div class="app-side__item"><div class="thumb cajonera"></div><span>Cajonera</span></div>
              <div class="app-side__item"><div class="thumb modular"></div><span>Modular</span></div>
              <div class="app-side__item"><div class="thumb base"></div><span>Base</span></div>
            </div>
          </aside>

          <main class="app-main">
            <div class="app-tabs">
              <div class="app-tabs__group">
                <button class="app-tab app-tab--active">Diseño</button>
                <button class="app-tab">Cubicación</button>
                <button class="app-tab">Biblioteca</button>
              </div>
              <div class="app-tabs__actions">
                <button class="app-actbtn">＋ Nuevo</button>
                <button class="app-actbtn app-actbtn--primary">⌘ Guardar</button>
              </div>
            </div>

            <div class="app-canvas">
              <div class="app-canvas__title">Canvas de diseño</div>
              <div class="app-canvas__zoom">
                <button>+</button>
                <span class="pct">100%</span>
                <button>−</button>
              </div>
              <div class="app-canvas__furniture">
                <div class="fpiece fpiece--door"><span class="fpiece__label">100×90</span><div class="leaf"></div><div class="leaf"></div></div>
                <div class="fpiece fpiece--door"><span class="fpiece__label">100×90</span><div class="leaf"></div><div class="leaf"></div></div>
                <div class="fpiece fpiece--drawer"><span class="fpiece__label">100×70</span><div class="row"></div><div class="row"></div><div class="row"></div></div>
                <div class="fpiece fpiece--drawer"><span class="fpiece__label">100×70</span><div class="row"></div><div class="row"></div><div class="row"></div></div>
                <div class="fpiece fpiece--base"></div>
              </div>
            </div>
          </main>

          <aside class="app-recent">
            <h4>Diseños recientes:</h4>
            <div class="app-recent__item">
              <div>
                <div class="name">1234</div>
                <div class="date">6/4/2026</div>
              </div>
              <span class="trash">🗑</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="strip">
  <div class="strip__inner">
    <span>
      <span>· corte por plancha</span><span class="dot"></span>
      <span>· cubicación automática</span><span class="dot"></span>
      <span>· biblioteca de piezas</span><span class="dot"></span>
      <span>· exporta a CSV / PDF</span><span class="dot"></span>
      <span>· conexión a CNC</span><span class="dot"></span>
      <span>· optimización de desperdicio</span><span class="dot"></span>
      <span>· corte por plancha</span><span class="dot"></span>
      <span>· cubicación automática</span><span class="dot"></span>
      <span>· biblioteca de piezas</span><span class="dot"></span>
      <span>· exporta a CSV / PDF</span><span class="dot"></span>
      <span>· conexión a CNC</span><span class="dot"></span>
      <span>· optimización de desperdicio</span><span class="dot"></span>
    </span>
  </div>
</div>

<section class="section" id="features" data-screen-label="Features">
  <div class="shell">
    <div class="s-head">
      <div>
        <div class="s-head__num">[ 01 / herramientas ]</div>
        <h2>Una mesa. <em>Tres</em> herramientas que no se sueltan.</h2>
      </div>
      <p class="s-head__lede">Diseña, cubica y guarda piezas reutilizables sin saltar entre planos, planillas y la cortadora. Todo conversa.</p>
    </div>
    <div class="feat">
      <div class="feat__card">
        <span class="tag">/ canvas</span>
        <div class="glyph gl-canvas">
          <div class="grid"></div>
          <div class="dim d1">— 205 cm —</div>
          <div class="dim d2">100×70</div>
          <div class="box b1"></div>
          <div class="box b2"></div>
          <div class="box b3"></div>
        </div>
        <h3>Diseño paramétrico por arrastre</h3>
        <p>Suelta estantes, cajoneras, modulares y bases sobre un canvas a escala. Cada pieza es un componente con cotas que viven con tu diseño — cambiá el ancho y todo se reajusta.</p>
      </div>
      <div class="feat__card">
        <span class="tag">/ cubicación</span>
        <div class="glyph gl-cub">
          <div class="r" style="grid-column:span 2;grid-row:span 2"></div>
          <div class="t" style="grid-column:span 2;grid-row:span 2"></div>
          <div class="t" style="grid-column:span 1;grid-row:span 3"></div>
          <div class="r" style="grid-column:span 2"></div>
          <div class="r" style="grid-column:span 2"></div>
          <div class="e" style="grid-column:span 2"></div>
          <div class="t" style="grid-column:span 2"></div>
        </div>
        <h3>Empaquetado óptimo en planchas reales</h3>
        <p>El motor toma cada pieza y resuelve el corte que minimiza desperdicio. Vas a saber exactamente cuántas planchas comprar.</p>
      </div>
      <div class="feat__card">
        <span class="tag">/ biblioteca</span>
        <div class="glyph gl-lib">
          <div class="item">repisa</div>
          <div class="item active">cajón</div>
          <div class="item">puerta</div>
          <div class="item">divisor</div>
          <div class="item active">base</div>
          <div class="item">tapa</div>
          <div class="item">copete</div>
          <div class="item">marco</div>
          <div class="item">zócalo</div>
        </div>
        <h3>Tu propia biblioteca de piezas</h3>
        <p>Guardá cada componente que diseñes y reutilizalo en el próximo trabajo.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="biblioteca" data-screen-label="Biblioteca">
  <div class="shell">
    <div class="s-head">
      <div>
        <div class="s-head__num">[ 03 / biblioteca ]</div>
        <h2>Tus piezas, <em>tu</em> kit.</h2>
      </div>
      <p class="s-head__lede">Cada pieza guardada se vuelve un ladrillo para armar el siguiente mueble en minutos.</p>
    </div>
    <div class="lib">
      <div class="lib__card">
        <div class="lib__thumb"></div>
        <div class="lib__name">Repisa flotante</div>
        <div class="lib__dim">90 × 25 cm · MDF 18</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb"></div>
        <div class="lib__name">Cajón estándar</div>
        <div class="lib__dim">60 × 45 × 30 cm</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb"></div>
        <div class="lib__name">Persiana plegable</div>
        <div class="lib__dim">120 × 80 cm</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb"></div>
        <div class="lib__name">Puerta abatible</div>
        <div class="lib__dim">50 × 100 cm</div>
      </div>
    </div>
  </div>
</section>

<section class="shell" id="cta" data-screen-label="CTA">
  <div class="cta">
    <div class="cta__inner">
      <h2>Deja de calcular en <em>papel</em>.</h2>
      <p>Empezá a diseñar y cubicar en un solo lugar. Gratis para tu primer proyecto.</p>
      <div class="cta__btns">
        <a href="#" class="btn btn--primary" data-login="true">Crear mi cuenta →</a>
        <a href="#" class="btn btn--outline">Ver demo (3 min)</a>
      </div>
    </div>
  </div>
</section>

<footer class="footer" data-screen-label="Footer">
  <div class="shell">
    <div class="footer__row">
      <div class="footer__col">
        <a href="#" class="brand" style="margin-bottom:12px">
          <span class="brand__mark"></span>
          TABLÓN
        </a>
        <p style="font-size:13px;color:var(--color-paper-grey);max-width:220px">La mesa de trabajo digital para carpinteros y diseñadores de muebles.</p>
      </div>
      <div class="footer__col">
        <h5>Producto</h5>
        <ul>
          <li>Diseño</li>
          <li>Cubicación</li>
          <li>Biblioteca</li>
          <li>Exportar a CNC</li>
        </ul>
      </div>
      <div class="footer__col">
        <h5>Recursos</h5>
        <ul>
          <li>Documentación</li>
          <li>Tutoriales</li>
          <li>Plantillas</li>
        </ul>
      </div>
      <div class="footer__col">
        <h5>Empresa</h5>
        <ul>
          <li>Nosotros</li>
          <li>Clientes</li>
          <li>Contacto</li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© 2026 Tablón Studio · hecho con aserrín digital</span>
      <span>v2.4.1 · estado: operativo</span>
    </div>
  </div>
</footer>
`

export default function LandingPage({ onLoginClick }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root || !onLoginClick) return

    const handleClick = (event) => {
      const target = event.target
      if (target && target.closest('[data-login]')) {
        event.preventDefault()
        onLoginClick()
      }
    }

    root.addEventListener('click', handleClick)
    return () => root.removeEventListener('click', handleClick)
  }, [onLoginClick])

  return (
    <div className="landing-page" ref={containerRef} dangerouslySetInnerHTML={{ __html: landingMarkup }} />
  )
}
