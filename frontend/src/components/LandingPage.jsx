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
      <span class="ink">la </span><span class="strike">madera</span><span class="ink">.</span>
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
      <span class="meta-sep">|</span>
      <span><strong>81.1%</strong> utilización promedio de plancha</span>
      <span class="meta-sep">|</span>
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
                  <div style="aspect-ratio:1;background:var(--color-paper-grey);border-radius:4px"></div>
                  <div style="font-size:11px">Repisa flotante</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">90×25</div>
                </div>
                <div style="background:var(--color-dots-black);border:1px solid var(--color-slate-border);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px">
                  <div style="aspect-ratio:1;background:var(--color-paper-grey);border-radius:4px;position:relative"><div style="position:absolute;inset:6px;border:2px solid var(--color-faded-grey)"></div></div>
                  <div style="font-size:11px">Cajón estándar</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">60×45</div>
                </div>
                <div style="background:var(--color-dots-black);border:1px solid var(--color-slate-border);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px">
                  <div style="aspect-ratio:1;background:var(--color-paper-grey);border-radius:4px;position:relative"><div style="position:absolute;inset:6px;background:repeating-linear-gradient(0deg,var(--color-faded-grey) 0 2px,transparent 2px 12px)"></div></div>
                  <div style="font-size:11px">Persiana</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">120×80</div>
                </div>
                <div style="background:var(--color-dots-black);border:1px solid var(--color-slate-border);border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px;border-color:var(--color-ideation-blue)">
                  <div style="aspect-ratio:1;background:var(--color-paper-grey);border-radius:4px;position:relative"><div style="position:absolute;inset:8px;border:2px solid var(--color-faded-grey);background:#fff"></div></div>
                  <div style="font-size:11px;color:var(--color-ideation-blue)">Puerta abatible</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--color-faded-grey)">50×100</div>
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
      <span>· biblioteca de piezas</span><span class="dot"></span>
      <span>· exporta a CSV / PDF</span><span class="dot"></span>
      <span>· conexión a CNC</span><span class="dot"></span>
      <span>· optimización de desperdicio</span><span class="dot"></span>
      <span>· planos por pieza</span><span class="dot"></span>
      <span>· corte por plancha</span><span class="dot"></span>
      <span>· cubicación automática</span><span class="dot"></span>
      <span>· biblioteca de piezas</span><span class="dot"></span>
      <span>· exporta a CSV / PDF</span><span class="dot"></span>
      <span>· conexión a CNC</span><span class="dot"></span>
      <span>· optimización de desperdicio</span><span class="dot"></span>
      <span>· planos por pieza</span><span class="dot"></span>
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
        <p>El motor toma cada pieza, la corta contra el formato de plancha que uses (1.83×2.50, 1.22×2.44…) y resuelve el corte que minimiza desperdicio. Vas a saber exactamente cuántas planchas comprar.</p>
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
        <p>Guardá cada componente que diseñes — un cajón de 60×45, una puerta abatible — y reutilizalo en el próximo trabajo. Tu propio kit, tus propias medidas estándar.</p>
      </div>
    </div>
  </div>
</section>

<section class="section--sm" data-screen-label="Flow">
  <div class="shell">
    <div class="flow">
      <div class="flow__step">
        <div class="flow__num">— paso 01</div>
        <div class="flow__title">Bocetá</div>
        <div class="flow__desc">Arrastrá módulos al canvas, definí medidas y separadores. Sin instalar nada.</div>
      </div>
      <div class="flow__step">
        <div class="flow__num">— paso 02</div>
        <div class="flow__title">Cubicá</div>
        <div class="flow__desc">Una pestaña: Tablón distribuye cada pieza en planchas reales y reporta utilización.</div>
      </div>
      <div class="flow__step">
        <div class="flow__num">— paso 03</div>
        <div class="flow__title">Cotizá</div>
        <div class="flow__desc">Exportá lista de cortes, costos por material y plano por pieza para el taller.</div>
      </div>
      <div class="flow__step">
        <div class="flow__num">— paso 04</div>
        <div class="flow__title">Cortá</div>
        <div class="flow__desc">Mandá el corte a la sierra o a la CNC con el archivo listo. Cero re-medir.</div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="cubicacion" data-screen-label="Big stat">
  <div class="shell">
    <div class="bigstat">
      <div class="bigstat__num">−<em>23</em>%</div>
      <div class="bigstat__copy">
        <h3>Menos plancha tirada al fondo del taller.</h3>
        <p>El motor de empaquetamiento prueba miles de combinaciones de orientación, rotación y agrupamiento por color/grano para resolver el corte con mayor utilización posible. Comparado con cubicaciones manuales típicas, los talleres beta reducen un 23% el desperdicio promedio.</p>
        <ul>
          <li>Bin-packing 2D con rotación y agrupado por material</li>
          <li>Soporta planchas múltiples y formatos personalizados</li>
          <li>Respeta el grano de la madera cuando lo marcás</li>
          <li>Exporta el patrón a DXF / SVG para CNC</li>
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
        <p>Tablón calcula automáticamente cuántas planchas necesitás y cómo se acomoda cada pieza. Cambiás una medida en el diseño y la cubicación se reactualiza al instante.</p>
        <p>Esto sirve para cotizar más rápido, comprar la cantidad justa, y entregar al cliente un presupuesto que respeta el material disponible.</p>

        <div class="detail__bullets">
          <div class="b">
            <div class="n">01</div>
            <div><strong>Multi-material</strong><span>Distinguí MDF 18mm, MDF 9mm, melamina, contrachapado — cada uno se cubica por separado y suma costos.</span></div>
          </div>
          <div class="b">
            <div class="n">02</div>
            <div><strong>Costo por plancha</strong><span>Cargá tu precio actual y Tablón te devuelve el costo total de materia prima del proyecto.</span></div>
          </div>
          <div class="b">
            <div class="n">03</div>
            <div><strong>Lista de cortes</strong><span>Exportá un PDF listo para el operario con cada pieza numerada y referenciada al plano.</span></div>
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
        <h2>Tus piezas, <em>tu</em> kit.</h2>
      </div>
      <p class="s-head__lede">Cada pieza guardada se vuelve un ladrillo: combinala con otras para armar el siguiente mueble en minutos.</p>
    </div>
    <div class="lib">
      <div class="lib__card">
        <div class="lib__thumb"><div style="position:absolute;inset:14% 14% 70% 14%;background:#a8a39c"></div></div>
        <div class="lib__name">Repisa flotante</div>
        <div class="lib__dim">90 × 25 cm · MDF 18</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb"><div style="position:absolute;inset:14%;background:transparent;border:3px solid #a8a39c"></div><div style="position:absolute;left:14%;right:14%;top:46%;height:3px;background:#a8a39c"></div></div>
        <div class="lib__name">Cajón estándar</div>
        <div class="lib__dim">60 × 45 × 30 cm</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb"><div style="position:absolute;inset:14%;background:repeating-linear-gradient(0deg,#a8a39c 0 4px,transparent 4px 12px)"></div></div>
        <div class="lib__name">Persiana plegable</div>
        <div class="lib__dim">120 × 80 cm</div>
      </div>
      <div class="lib__card">
        <div class="lib__thumb"><div style="position:absolute;inset:18%;background:#fff;border:3px solid #a8a39c"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:32px;background:#222;border-radius:2px"></div></div>
        <div class="lib__name">Puerta abatible</div>
        <div class="lib__dim">50 × 100 cm</div>
      </div>
    </div>
  </div>
</section>

<section class="section--sm" data-screen-label="Quote">
  <div class="shell">
    <div class="quote">
      <div>
        <q>Antes me tomaba media tarde sentarme con la calculadora a ver cuántas planchas pedir. Ahora lo veo mientras dibujo — y compro justo.</q>
        <div class="quote__att">
          <strong>Mariano Sotelo</strong>
          Maestro carpintero · Taller La Astilla, Córdoba
        </div>
      </div>
      <div class="quote__avatar"></div>
    </div>
  </div>
</section>

<section class="section" id="precios" data-screen-label="Precios">
  <div class="shell">
    <div class="s-head">
      <div>
        <div class="s-head__num">[ 04 / precios ]</div>
        <h2>Pagás por proyecto, no por <em>asiento</em>.</h2>
      </div>
      <p class="s-head__lede">Sin contratos anuales. Cancelás cuando quieras. Cobramos por trabajo terminado, no por estar logueado.</p>
    </div>

    <div class="price">
      <div class="price__card">
        <div class="price__name">Banco</div>
        <div class="price__amt">US$ 0<span class="per">/ siempre</span></div>
        <p style="color:var(--color-paper-grey);font-size:14px">Para diseñar tu primer mueble y probar el flujo completo.</p>
        <ul class="price__list">
          <li>1 proyecto activo</li>
          <li>Cubicación con marca de agua</li>
          <li>Biblioteca de 5 piezas</li>
          <li>Soporte por mail</li>
        </ul>
        <a href="#" class="btn btn--outline" data-login="true" style="margin-top:auto;justify-content:center">Empezar</a>
      </div>

      <div class="price__card featured">
        <div class="price__name">Taller</div>
        <div class="price__amt">US$ 19<span class="per">/ mes</span></div>
        <p style="color:var(--color-paper-grey);font-size:14px">Para carpinteros y diseñadores que cotizan varios trabajos por mes.</p>
        <ul class="price__list">
          <li>Proyectos ilimitados</li>
          <li>Cubicación multi-material</li>
          <li>Biblioteca ilimitada</li>
          <li>Exporta DXF / SVG / PDF</li>
          <li>Lista de cortes para operario</li>
        </ul>
        <a href="#" class="btn btn--primary" data-login="true" style="margin-top:auto;justify-content:center">Empezar 14 días gratis</a>
      </div>

      <div class="price__card">
        <div class="price__name">Fábrica</div>
        <div class="price__amt">a medida<span class="per"></span></div>
        <p style="color:var(--color-paper-grey);font-size:14px">Para fábricas con CNC, multi-equipo y catálogo propio.</p>
        <ul class="price__list">
          <li>Equipo y permisos</li>
          <li>Conector CNC y SSO</li>
          <li>Catálogo compartido</li>
          <li>API y webhooks</li>
          <li>Soporte dedicado</li>
        </ul>
        <a href="#" class="btn btn--outline" data-login="true" style="margin-top:auto;justify-content:center">Hablar con ventas</a>
      </div>
    </div>
  </div>
</section>

<section class="shell" id="cta" data-screen-label="CTA">
  <div class="cta">
    <div class="cta__inner">
      <h2>Dejá de calcular en <em>servilleta</em>.</h2>
      <p>Empezá a diseñar y cubicar en un solo lugar. Gratis para tu primer proyecto, sin tarjeta.</p>
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
          <li>Cambios v2.4</li>
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
    if (!root) return

    const handleClick = (event) => {
      const target = event.target
      if (onLoginClick && target && target.closest('[data-login]')) {
        event.preventDefault()
        onLoginClick()
      }
    }
    root.addEventListener('click', handleClick)

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
