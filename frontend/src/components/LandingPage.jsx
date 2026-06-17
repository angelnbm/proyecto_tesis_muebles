import React, { useEffect, useRef } from 'react'
import '../styles/landing.css'

const landingMarkup = `
<header class="nav" data-screen-label="Nav">
  <div class="shell nav__inner">
    <a href="#" class="brand">
      <svg class="brand__mark" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="11" height="11" rx="2" fill="#4586da"/><rect x="13" width="11" height="11" rx="2" stroke="#f8f4f1" stroke-width="1.5"/><rect y="13" width="11" height="11" rx="2" stroke="#f8f4f1" stroke-width="1.5"/><rect x="13" y="13" width="11" height="11" rx="2" stroke="#3c3c3e" stroke-width="1.5"/></svg>
      AMEDIDA
    </a>
    <nav class="nav__links">
      <a href="#producto">Producto</a>
      <a href="#cubicacion">Cubicación</a>
      <a href="#biblioteca">Biblioteca</a>
      <a href="#docs">Docs</a>
    </nav>
    <div class="nav__cta">
      <a href="#" class="btn" data-login="true" style="font-size:14px;color:var(--color-paper-grey);padding:8px 12px">Ingresar</a>
      <a href="#" class="btn btn--primary" data-login="true" style="padding:8px 14px">Empezar</a>
    </div>
    <button class="nav__burger" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="nav__mobile-menu">
    <a href="#producto">Producto</a>
    <a href="#cubicacion">Cubicación</a>
    <a href="#biblioteca">Biblioteca</a>
    <a href="#docs">Docs</a>
    <a href="#" class="btn btn--primary nav__mobile-cta" data-login="true">Empezar →</a>
  </div>
</header>

<section class="hero" data-screen-label="Hero">
  <div class="hero__grid"></div>
  <div class="shell hero__inner">
    <div class="hero__eyebrow">
      <span class="dot"></span>
      <span>Precisión artesanal, velocidad digital</span>
    </div>

    <h1>
      <span class="ink">Diseña el</span><br/>
      <span class="ink">mueble.</span> <span class="accent">Calcula</span><br/>
      <span class="ink">la </span><span class="strike">madera</span><span class="ink">.</span>
    </h1>

    <p class="hero__sub">
      Amedida es la mesa de trabajo digital para mueblistas artesanales y carpinteros. Diseña estantes, cajoneras y modulares en 2D por arrastre, calcula automáticamente la cantidad de planchas y genera cotizaciones detalladas para tu cliente.
    </p>

    <div class="hero__cta">
      <a href="#cta" class="btn btn--primary" data-login="true">Empezar a diseñar →</a>
      <a href="#producto" class="btn btn--outline">Ver el producto</a>
    </div>

    <div class="hero__meta">
      <span><strong>−90%</strong> en tiempo de cubicación</span>
      <span class="meta-sep">|</span>
      <span><strong>81.1%</strong> utilización promedio de plancha</span>
      <span class="meta-sep">|</span>
      <span><strong>0</strong> instalación · solo navegador</span>
    </div>

    <div id="producto" style="margin-top:64px" data-screen-label="Product preview">
      <div class="window">
        <div class="window__chrome">
          <div class="window__dots">
            <div class="window__dot"></div>
            <div class="window__dot"></div>
            <div class="window__dot"></div>
          </div>
          <div class="window__addr">app.amedida.cl / proyecto · 1234</div>
          <div style="width:60px"></div>
        </div>
        <div class="window__body" id="appBody">
          <!-- sidebar -->
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

          <!-- main -->
          <main class="app-main">
            <div class="app-tabs">
              <div class="app-tabs__group">
                <button class="app-tab" data-tab="diseno">Diseño</button>
                <button class="app-tab" data-tab="cubicacion">Cubicación</button>
                <button class="app-tab" data-tab="biblioteca">Biblioteca</button>
              </div>
              <div class="app-tabs__actions">
                <button class="app-actbtn">＋ Nuevo</button>
                <button class="app-actbtn app-actbtn--primary">⌘ Guardar</button>
              </div>
            </div>

            <!-- DISEÑO PANEL -->
            <div class="app-canvas" data-panel="diseno">
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

            <!-- CUBICACIÓN PANEL -->
            <div class="app-cub" data-panel="cubicacion" style="display:none">
              <div class="app-cub__title">Visualización de empaquetamiento en planchas</div>
              <div class="plancha">
                <div class="plancha__hd">
                  <strong>Plancha #1</strong>
                  <div class="stats">Util: <b>81.1%</b> · Desp: <em>18.9%</em></div>
                </div>
                <div class="plancha__sheet" style="grid-template-columns:repeat(6,1fr);grid-auto-rows:38px">
                  <div class="plancha__cell cell--red" style="grid-column:span 2;grid-row:span 2">100×70<br/>Fondo</div>
                  <div class="plancha__cell cell--teal" style="grid-column:span 2;grid-row:span 2">100×70<br/>Fondo</div>
                  <div class="plancha__cell cell--teal" style="grid-column:span 2;grid-row:span 3">45×100<br/>Divisores</div>
                  <div class="plancha__cell cell--red" style="grid-column:span 2;grid-row:span 2">100×70<br/>Fondo</div>
                  <div class="plancha__cell cell--teal" style="grid-column:span 2;grid-row:span 2">100×70<br/>Estantes</div>
                  <div class="plancha__cell cell--red" style="grid-column:span 2">100×23<br/>Frente</div>
                  <div class="plancha__cell cell--red" style="grid-column:span 2">100×23<br/>Frente</div>
                </div>
                <div class="plancha__legend">
                  <div class="row"><span class="sw" style="background:#e9756a"></span>Fondo (100×70 cm)</div>
                  <div class="row"><span class="sw" style="background:#e9756a"></span>Frente (100×23 cm)</div>
                  <div class="row"><span class="sw" style="background:#4ec5b3"></span>Estantes (100×70 cm)</div>
                </div>
              </div>
              <div class="plancha">
                <div class="plancha__hd">
                  <strong>Plancha #2</strong>
                  <div class="stats">Util: <b>78.4%</b> · Desp: <em>21.6%</em></div>
                </div>
                <div class="plancha__sheet" style="grid-template-columns:repeat(6,1fr);grid-auto-rows:38px">
                  <div class="plancha__cell cell--teal" style="grid-column:span 2;grid-row:span 2">100×70<br/>Estantes</div>
                  <div class="plancha__cell cell--teal" style="grid-column:span 2;grid-row:span 2">100×70<br/>Estantes</div>
                  <div class="plancha__cell cell--teal" style="grid-column:span 2;grid-row:span 3">45×100<br/>Divisores</div>
                  <div class="plancha__cell cell--red" style="grid-column:span 2;grid-row:span 2">100×70<br/>Fondo</div>
                  <div class="plancha__cell cell--teal" style="grid-column:span 2;grid-row:span 2">100×70<br/>Estantes</div>
                  <div class="plancha__cell cell--red" style="grid-column:span 2">100×23<br/>Frente</div>
                  <div class="plancha__cell cell--red" style="grid-column:span 2">100×23<br/>Frente</div>
                </div>
                <div class="plancha__legend">
                  <div class="row"><span class="sw" style="background:#4ec5b3"></span>Estantes (100×70 cm)</div>
                  <div class="row"><span class="sw" style="background:#e9756a"></span>Fondo (100×70 cm)</div>
                  <div class="row"><span class="sw" style="background:#4ec5b3"></span>Divisores (45×100 cm)</div>
                </div>
              </div>
            </div>

            <!-- BIBLIOTECA PANEL -->
            <div class="app-canvas" data-panel="biblioteca" style="display:none;background:var(--color-ink-black);border-color:var(--color-slate-border);padding:14px;display:none">
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
                <div style="background:var(--color-dots-black);border:1px solid var(--color-slate-border);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px">
                  <div style="aspect-ratio:1;background:#e8e3dd;border-radius:4px;position:relative;overflow:hidden"><div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 18px,rgba(0,0,0,.06) 18px 19px)"></div></div>
                  <div style="font-size:9px;color:var(--color-faded-grey);text-transform:uppercase;letter-spacing:.08em">Material</div>
                  <div style="font-size:11px">Melamina Blanca 18</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">$ 18.500 / plancha</div>
                </div>
                <div style="background:var(--color-dots-black);border:1px solid var(--color-slate-border);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px">
                  <div style="aspect-ratio:1;background:var(--color-dark-card);border-radius:4px;position:relative;display:flex;align-items:center;justify-content:center;gap:3px;flex-direction:column"><div style="width:70%;height:3px;background:var(--color-faded-grey);border-radius:2px"></div><div style="width:70%;height:3px;background:var(--color-faded-grey);border-radius:2px"></div><div style="width:14px;height:14px;border:2px solid var(--color-faded-grey);border-radius:50%;position:absolute;right:14%;bottom:14%"></div></div>
                  <div style="font-size:9px;color:var(--color-faded-grey);text-transform:uppercase;letter-spacing:.08em">Accesorio</div>
                  <div style="font-size:11px">Corredera telescópica</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">$ 4.200 / par</div>
                </div>
                <div style="background:var(--color-dots-black);border:1px solid var(--color-slate-border);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px">
                  <div style="aspect-ratio:1;background:var(--color-dark-card);border-radius:4px;position:relative"><div style="position:absolute;inset:18% 12%;border:2px solid var(--color-faded-grey);border-radius:2px"></div><div style="position:absolute;top:50%;left:12%;right:12%;height:2px;background:var(--color-faded-grey)"></div></div>
                  <div style="font-size:9px;color:var(--color-faded-grey);text-transform:uppercase;letter-spacing:.08em">Tipo cajón</div>
                  <div style="font-size:11px">Cajón estándar</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">MDF 15 · fondo 9mm</div>
                </div>
                <div style="background:var(--color-dots-black);border:1px solid var(--color-ideation-blue);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px">
                  <div style="aspect-ratio:1;background:var(--color-dark-card);border-radius:4px;position:relative;overflow:hidden"><div style="position:absolute;top:0;left:0;right:0;height:22%;background:#e8e3dd"></div><div style="position:absolute;top:22%;left:0;right:0;bottom:0;background:var(--color-dark-card)"></div></div>
                  <div style="font-size:9px;color:var(--color-ideation-blue);text-transform:uppercase;letter-spacing:.08em">Tapa canto</div>
                  <div style="font-size:11px;color:var(--color-ideation-blue)">Enchape PVC blanco</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">$ 650 / ml</div>
                </div>
              </div>
            </div>
          </main>

          <!-- right panel -->
          <aside class="app-recent">
            <h4>Diseños recientes:</h4>
            <div class="app-recent__item">
              <div>
                <div class="name">1234</div>
                <div class="date">6/4/2026</div>
              </div>
              <span class="trash">🗑</span>
            </div>
            <div class="app-recent__item" style="margin-top:8px">
              <div>
                <div class="name">Cocina · López</div>
                <div class="date">5/2/2026</div>
              </div>
              <span class="trash">🗑</span>
            </div>
            <div class="app-recent__item" style="margin-top:8px">
              <div>
                <div class="name">Vitrina A</div>
                <div class="date">4/28/2026</div>
              </div>
              <span class="trash">🗑</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- MARQUEE -->
<div class="strip">
  <div class="strip__inner">
    <span>
      <span>· corte por plancha</span><span class="dot"></span>
      <span>· cubicación automática</span><span class="dot"></span>
      <span>· catálogo de materiales</span><span class="dot"></span>
      <span>· cotizaciones en PDF</span><span class="dot"></span>
      <span>· historial de diseños</span><span class="dot"></span>
      <span>· optimización de desperdicio</span><span class="dot"></span>
      <span>· estadísticas de ventas</span><span class="dot"></span>
      <span>· corte por plancha</span><span class="dot"></span>
      <span>· cubicación automática</span><span class="dot"></span>
      <span>· catálogo de materiales</span><span class="dot"></span>
      <span>· cotizaciones en PDF</span><span class="dot"></span>
      <span>· historial de diseños</span><span class="dot"></span>
      <span>· optimización de desperdicio</span><span class="dot"></span>
      <span>· estadísticas de ventas</span><span class="dot"></span>
    </span>
  </div>
</div>

<!-- FEATURES -->
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
        <p>Suelta estantes, cajoneras, modulares y bases sobre un canvas a escala. Cada pieza es un componente con cotas que viven con tu diseño — cambia el ancho y todo se reajusta.</p>
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
        <p>El motor toma cada pieza, la corta contra el formato de plancha que elijas (1.83×2.50, 1.22×2.44…) y resuelve el corte que minimiza desperdicio. Sabrás exactamente cuántas planchas comprar.</p>
      </div>

      <div class="feat__card">
        <span class="tag">/ biblioteca</span>
        <div class="glyph gl-lib">
          <div class="item">material</div>
          <div class="item active">accesorio</div>
          <div class="item">tipo cajón</div>
          <div class="item active">tapa canto</div>
          <div class="item">melamina</div>
          <div class="item">MDF</div>
          <div class="item">corredera</div>
          <div class="item">visagra</div>
          <div class="item">enchape</div>
        </div>
        <h3>Tu catálogo de materiales y accesorios</h3>
        <p>Registrá tus planchas (melamina, MDF, contrachapado) con precio y formato. Agregá correderas, visagras y tiradores. Definí plantillas de cajón por material. La cubicación los usa todos automáticamente.</p>
      </div>
    </div>
  </div>
</section>

<section class="section--sm" data-screen-label="Flow">
  <div class="shell">
    <div class="flow">
      <div class="flow__step">
        <div class="flow__num">— paso 01</div>
        <div class="flow__title">Diseña</div>
        <div class="flow__desc">Arrastra módulos al canvas, define medidas y separadores. Sin instalar nada.</div>
      </div>
      <div class="flow__step">
        <div class="flow__num">— paso 02</div>
        <div class="flow__title">Cubica</div>
        <div class="flow__desc">Una pestaña: Amedida distribuye cada pieza en planchas reales y reporta utilización y desperdicio.</div>
      </div>
      <div class="flow__step">
        <div class="flow__num">— paso 03</div>
        <div class="flow__title">Cotiza</div>
        <div class="flow__desc">Exporta la lista de cortes y los costos por material en un presupuesto PDF listo para el cliente.</div>
      </div>
      <div class="flow__step">
        <div class="flow__num">— paso 04</div>
        <div class="flow__title">Envía</div>
        <div class="flow__desc">Envía la cotización al cliente directamente desde la plataforma. El presupuesto llega listo, sin re-calcular.</div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="cubicacion" data-screen-label="Big stat">
  <div class="shell">
    <div class="bigstat">
      <div class="bigstat__num">−<em>90</em>%</div>
      <div class="bigstat__copy">
        <h3>Menos tiempo calculando, más tiempo fabricando.</h3>
        <p>El proceso manual de cubicación puede tomar entre 2 y 8 horas para un mueble complejo. Amedida lo resuelve automáticamente al finalizar el diseño, reduciendo ese tiempo en un 90%. Más horas para fabricar, menos horas frente a la calculadora.</p>
        <ul>
          <li>Bin-packing 2D con rotación y agrupado por material</li>
          <li>Soporta planchas múltiples y formatos personalizados</li>
          <li>Respeta el grano de la madera cuando lo marcas</li>
          <li>Genera lista de cortes y cotización en PDF para el cliente</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section" data-screen-label="Cubicación detail">
  <div class="shell">
    <div class="s-head">
      <div>
        <div class="s-head__num">[ 02 / cubicación ]</div>
        <h2>Cada pieza, en su <em>plancha</em>.</h2>
      </div>
      <p class="s-head__lede">Lo que antes era una hoja Excel y un boceto a mano, ahora es una sola visualización viva.</p>
    </div>

    <div class="detail">
      <div class="detail__copy">
        <h3>De la <em>idea</em> al corte, sin planilla.</h3>
        <p>Amedida calcula automáticamente cuántas planchas necesitas y cómo se acomoda cada pieza. Cambias una medida en el diseño y la cubicación se reactualiza al instante.</p>
        <p>Esto sirve para cotizar más rápido, comprar la cantidad justa, y entregar al cliente un presupuesto que respeta el material disponible.</p>

        <div class="detail__bullets">
          <div class="b">
            <div class="n">01</div>
            <div><strong>Multi-material</strong><span>Distinguí MDF 18mm, MDF 9mm, melamina, contrachapado — cada uno se cubica por separado y suma costos.</span></div>
          </div>
          <div class="b">
            <div class="n">02</div>
            <div><strong>Costo por plancha</strong><span>Carga tu precio actual y Amedida te devuelve el costo total de materia prima del proyecto.</span></div>
          </div>
          <div class="b">
            <div class="n">03</div>
            <div><strong>Lista de cortes</strong><span>Exporta un PDF listo para el operario con cada pieza numerada y su cotización detallada para el cliente.</span></div>
          </div>
        </div>
      </div>

      <div class="detail__viz">
        <div class="detail__viz-hd">
          <span>plancha #1 / 250 × 183 cm · MDF 18mm</span>
          <span class="pill">en vivo</span>
        </div>
        <div class="viz-sheet">
          <div class="viz-cell r" style="grid-column:span 3;grid-row:span 2">100×70<br/>Fondo</div>
          <div class="viz-cell t" style="grid-column:span 3;grid-row:span 2">100×70<br/>Fondo</div>
          <div class="viz-cell t" style="grid-column:span 2;grid-row:span 3">45×100<br/>Divisores</div>
          <div class="viz-cell r" style="grid-column:span 3;grid-row:span 2">100×70<br/>Fondo</div>
          <div class="viz-cell t" style="grid-column:span 3;grid-row:span 2">100×70<br/>Estantes</div>
          <div class="viz-cell r" style="grid-column:span 3">100×23<br/>Frente</div>
          <div class="viz-cell r" style="grid-column:span 3">100×23<br/>Frente</div>
          <div class="viz-cell e" style="grid-column:span 2;grid-row:span 1">desperdicio</div>
          <span class="meta">250 × 183 cm</span>
        </div>

        <div class="viz-stats">
          <div class="viz-stat green">
            <div class="label">Utilización</div>
            <div class="val">81.1%</div>
          </div>
          <div class="viz-stat orange">
            <div class="label">Desperdicio</div>
            <div class="val">18.9%</div>
          </div>
          <div class="viz-stat">
            <div class="label">Costo plancha</div>
            <div class="val" style="font-size:24px">US$ 84</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="biblioteca" data-screen-label="Biblioteca">
  <div class="shell">
    <div class="s-head">
      <div>
        <div class="s-head__num">[ 03 / biblioteca ]</div>
        <h2>Tu catálogo, <em>siempre</em> listo.</h2>
      </div>
      <p class="s-head__lede">Carga una vez tus planchas, accesorios y tapa canto con precio. Cada proyecto los usa automáticamente — sin re-ingresar nada.</p>
    </div>
    <div class="lib">
      <div class="lib__card">
        <div class="lib__thumb">
          <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" fill="#1a1a1c"/>
            <!-- Tableros apilados — corte transversal (cara blanca / aglomerado / cara blanca) -->
            <rect x="8" y="13" width="64" height="14" rx="1.5" fill="#c4a882"/>
            <rect x="8" y="13" width="64" height="3.5" fill="#e8e3dd"/>
            <rect x="8" y="23.5" width="64" height="3.5" fill="#e8e3dd"/>
            <rect x="8" y="32" width="64" height="14" rx="1.5" fill="#c4a882"/>
            <rect x="8" y="32" width="64" height="3.5" fill="#e8e3dd"/>
            <rect x="8" y="42.5" width="64" height="3.5" fill="#e8e3dd"/>
            <rect x="8" y="51" width="64" height="14" rx="1.5" fill="#c4a882"/>
            <rect x="8" y="51" width="64" height="3.5" fill="#e8e3dd"/>
            <rect x="8" y="61.5" width="64" height="3.5" fill="#e8e3dd"/>
            <!-- Highlight accent en el canto del tablero superior -->
            <rect x="8" y="13" width="3" height="14" rx="1" fill="#4586da" opacity=".35"/>
          </svg>
        </div>
        <div style="font-size:10px;color:var(--color-ideation-blue);text-transform:uppercase;letter-spacing:.1em;font-weight:600">Material</div>
        <div class="lib__name">Melamina Blanca 18mm</div>
        <div class="lib__dim">244 × 183 cm · $ 18.500</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb">
          <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" fill="#1a1a1c"/>
            <!-- Marco del mueble (hueco del cajón) -->
            <rect x="8" y="10" width="64" height="60" rx="2" stroke="#3c3c3e" stroke-width="1.5" fill="#131313"/>
            <!-- Estante superior -->
            <rect x="10" y="20" width="60" height="2" fill="#3c3c3e"/>
            <!-- Cuerpo del cajón (interior) -->
            <rect x="14" y="34" width="52" height="28" rx="1" fill="#242425" stroke="#3c3c3e" stroke-width="1"/>
            <!-- Frente del cajón (panel blanco melamina) -->
            <rect x="14" y="28" width="52" height="10" rx="1.5" fill="#e8e3dd"/>
            <!-- Tirador centrado -->
            <rect x="32" y="32" width="16" height="2.5" rx="1.5" fill="#8d8a88"/>
            <!-- Correderas (dos barras azules abajo a los costados) -->
            <rect x="14" y="61" width="24" height="3" rx="1" fill="#4586da" opacity=".55"/>
            <rect x="42" y="61" width="24" height="3" rx="1" fill="#4586da" opacity=".55"/>
          </svg>
        </div>
        <div style="font-size:10px;color:var(--color-ideation-blue);text-transform:uppercase;letter-spacing:.1em;font-weight:600">Tipo de cajón</div>
        <div class="lib__name">Cajón estándar</div>
        <div class="lib__dim">Laterales MDF 15 · fondo 9mm</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb">
          <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" fill="#1a1a1c"/>
            <!-- Riel externo (completo) -->
            <rect x="5" y="23" width="70" height="10" rx="2" fill="#2f2f31" stroke="#5c5b5a" stroke-width="1"/>
            <circle cx="14" cy="28" r="2.5" fill="#1a1a1c" stroke="#5c5b5a" stroke-width="1"/>
            <circle cx="66" cy="28" r="2.5" fill="#1a1a1c" stroke="#5c5b5a" stroke-width="1"/>
            <!-- Riel interno (telescópico, extendido) -->
            <rect x="5" y="47" width="54" height="10" rx="2" fill="#4586da" opacity=".6"/>
            <circle cx="14" cy="52" r="2" fill="#131313" opacity=".8"/>
            <circle cx="44" cy="52" r="2" fill="#131313" opacity=".8"/>
            <!-- Indicador de extensión -->
            <line x1="59" y1="52" x2="72" y2="52" stroke="#4586da" stroke-width="1.5" stroke-dasharray="3 2" opacity=".4"/>
            <path d="M69 49.5 L73 52 L69 54.5" stroke="#4586da" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>
          </svg>
        </div>
        <div style="font-size:10px;color:var(--color-ideation-blue);text-transform:uppercase;letter-spacing:.1em;font-weight:600">Accesorio</div>
        <div class="lib__name">Corredera telescópica</div>
        <div class="lib__dim">45 cm · $ 4.200 / par</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb">
          <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" fill="#1a1a1c"/>
            <!-- Tablero visto desde el canto (corte transversal) -->
            <!-- Cuerpo aglomerado -->
            <rect x="14" y="12" width="44" height="56" rx="2" fill="#c4a882"/>
            <!-- Cara superior melamina -->
            <rect x="14" y="12" width="44" height="5" fill="#e8e3dd"/>
            <!-- Cara inferior melamina -->
            <rect x="14" y="63" width="44" height="5" fill="#e8e3dd"/>
            <!-- Canto derecho sin enchape (borde aglomerado expuesto) -->
            <line x1="58" y1="16" x2="58" y2="64" stroke="#3c3c3e" stroke-width="1" stroke-dasharray="3 3"/>
            <!-- Tapa canto aplicada al canto izquierdo (blanco + accent azul) -->
            <rect x="6" y="12" width="8" height="56" rx="1.5" fill="#f8f4f1"/>
            <rect x="6" y="12" width="2.5" height="56" fill="#4586da" opacity=".35"/>
          </svg>
        </div>
        <div style="font-size:10px;color:var(--color-ideation-blue);text-transform:uppercase;letter-spacing:.1em;font-weight:600">Tapa canto</div>
        <div class="lib__name">Enchape PVC blanco</div>
        <div class="lib__dim">Se calcula en ml · $ 650 / ml</div>
      </div>
    </div>
  </div>
</section>

<section class="section--sm" data-screen-label="Quote">
  <div class="shell">
    <div class="quote">
      <div>
        <q>Antes me demoraba toda una tarde calculando cuántas planchas necesitaba para cada encargo. Ahora lo tengo al instante mientras diseño — y compro exactamente lo que necesito.</q>
        <div class="quote__att">
          <strong>Juan Pérez</strong>
          Mueblista artesanal · Taller de muebles, Teno
        </div>
      </div>
      <div class="quote__avatar"></div>
    </div>
  </div>
</section>

<section class="shell" id="cta" data-screen-label="CTA">
  <div class="cta">
    <div class="cta__inner">
      <h2>Deja de calcular en <em>servilleta</em>.</h2>
      <p>Diseña y cubica en un solo lugar, directo desde el navegador.</p>
      <div class="cta__btns">
        <a href="#" class="btn btn--primary" data-login="true">Crear mi cuenta →</a>
      </div>
    </div>
  </div>
</section>

<footer class="footer" data-screen-label="Footer">
  <div class="shell">
    <div class="footer__row">
      <div class="footer__col">
        <a href="#" class="brand" style="margin-bottom:12px">
          <svg class="brand__mark" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="11" height="11" rx="2" fill="#4586da"/><rect x="13" width="11" height="11" rx="2" stroke="#f8f4f1" stroke-width="1.5"/><rect y="13" width="11" height="11" rx="2" stroke="#f8f4f1" stroke-width="1.5"/><rect x="13" y="13" width="11" height="11" rx="2" stroke="#3c3c3e" stroke-width="1.5"/></svg>
          AMEDIDA
        </a>
        <p style="font-size:13px;color:var(--color-paper-grey);max-width:220px">Precisión artesanal, velocidad digital.</p>
      </div>
      <div class="footer__col">
        <h5>Producto</h5>
        <ul>
          <li>Diseño</li>
          <li>Cubicación</li>
          <li>Biblioteca</li>
          <li>Cotizaciones</li>
          <li>Novedades</li>
        </ul>
      </div>
      <div class="footer__col">
        <h5>Recursos</h5>
        <ul>
          <li>Documentación</li>
          <li>Tutoriales</li>
          <li>Plantillas</li>
          <li>Calculadora de costos</li>
          <li>Comunidad</li>
        </ul>
      </div>
      <div class="footer__col">
        <h5>Empresa</h5>
        <ul>
          <li>Nosotros</li>
          <li>Clientes</li>
          <li>Contacto</li>
          <li>Términos</li>
          <li>Privacidad</li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© 2026 Amedida · hecho con aserrín digital</span>
      <span>Beta · estado: operativo</span>
    </div>
  </div>
</footer>
`

export default function LandingPage({ onLoginClick }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const handleClick = (event) => {
      const target = event.target
      if (onLoginClick && target && target.closest('[data-login]')) {
        event.preventDefault()
        onLoginClick()
      }
    }
    root.addEventListener('click', handleClick)

    // Hamburger menu toggle
    const burger = root.querySelector('.nav__burger')
    const navEl  = root.querySelector('.nav')
    if (burger && navEl) {
      burger.addEventListener('click', () => navEl.classList.toggle('nav--open'))
      root.querySelectorAll('.nav__mobile-menu a').forEach(link => {
        link.addEventListener('click', () => navEl.classList.remove('nav--open'))
      })
    }

    // Tab switching for product preview
    const tabs = root.querySelectorAll('.app-tab')
    const panels = root.querySelectorAll('[data-panel]')

    const activate = (name) => {
      tabs.forEach(t => t.classList.toggle('app-tab--active', t.dataset.tab === name))
      panels.forEach(p => { p.style.display = p.dataset.panel === name ? '' : 'none' })
    }

    let auto = true
    tabs.forEach(t => t.addEventListener('click', () => { auto = false; activate(t.dataset.tab) }))
    activate('diseno')

    const order = ['diseno', 'cubicacion', 'biblioteca']
    let i = 0
    const interval = setInterval(() => {
      if (!auto) return
      i = (i + 1) % order.length
      activate(order[i])
    }, 4500)

    return () => {
      root.removeEventListener('click', handleClick)
      clearInterval(interval)
    }
  }, [onLoginClick])

  return (
    <div className="landing-page" ref={containerRef} dangerouslySetInnerHTML={{ __html: landingMarkup }} />
  )
}
