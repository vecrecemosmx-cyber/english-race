// ==========================================
// 1. NAVEGACIÓN GLOBAL DE PANTALLAS
// ==========================================
window.mostrarPantalla = (pantallaId) => {
    document.querySelectorAll('#pantalla-bienvenida, #pantalla-curso, #pantalla-evaluacion')
            .forEach(p => p.classList.add('oculto'));
    document.getElementById(pantallaId)?.classList.remove('oculto');
};

window.alternarMenu = () => {
    document.getElementById('barraLateral')?.classList.toggle('abierto');
};

window.cargarLeccion = (numeroLeccion) => {
    const zonaContenido = document.getElementById('zona-dinamica-leccion');
    if (!zonaContenido) return;

    document.querySelectorAll('.item-leccion').forEach((btn, idx) => {
        btn.classList.toggle('activo', idx === (numeroLeccion - 1));
    });

    if (window.innerWidth < 768) {
        document.getElementById('barraLateral')?.classList.remove('abierto');
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // Estructura HTML base reutilizable para las lecciones 2 y 3
    const generarHTMLTabla = (titulo, color, leyenda) => `
        <div class="contenedor-tabla-interactiva">
            <div class="tarjeta" style="margin-bottom: 20px; padding: 20px;">
                <h2 style="color:${color}; margin-bottom:8px;">${titulo}</h2>
                <p class="subtitulo-tabla">Haz clic en cualquier fonema para escuchar su sonido real de voz humana aislada.</p>
                <div class="leyenda-unificada">
                    <div class="leyenda-item-u">
                        <div class="cuadro-color cuadro-${leyenda}"></div>
                        <span>${leyenda === 'vocal' ? 'Vocales y Diptongos' : 'Consonantes'}</span>
                    </div>
                </div>
            </div>
            <div id="tabla-fonemas-dinamica" class="grid-fonemas-u"></div>
        </div>`;

    switch(numeroLeccion) {
        case 1:
            zonaContenido.innerHTML = `
                <div class="tarjeta" style="width:100%; max-width:500px; text-align:left;">
                    <h2 style="color:#0284c7; margin-bottom:15px;">Lección 1: Metodología</h2>
                    <p style="line-height:1.6; color:#334155;">Aquí irá la explicación del método de aprendizaje fonético IPA, el uso de símbolos y la regularidad de la práctica diaria.</p>
                </div>`;
            break;
        case 2:
            zonaContenido.innerHTML = generarHTMLTabla("Lección 2: Vocales del Alfabeto Fonético", "#0284c7", "vocal");
            renderizarTablaPorTipo("vocal");
            break;
        case 3:
            zonaContenido.innerHTML = generarHTMLTabla("Lección 3: Consonantes del Alfabeto Fonético", "#10b981", "consonante");
            renderizarTablaPorTipo("consonante");
            break;
        case 4:
            zonaContenido.innerHTML = document.getElementById('plantilla-app-fonemas')?.innerHTML || '';
            setTimeout(() => typeof window.inicializarInterfazFonema === 'function' && window.inicializarInterfazFonema(), 50);
            break;
        default:
            zonaContenido.innerHTML = `<div class="tarjeta"><h2>Contenido en construcción</h2><p>Pronto estará disponible esta lección.</p></div>`;
    }
};

// ==========================================
// 2. LÓGICA DE LA APP DE FONEMAS (DOMContentLoaded)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const baseDatosCategorias = {
        'vocales_cortas': [
            { 
                simbolo: '/ɪ/', tipo: 'SHORT VOWEL', textoAudioAislado: 'ih', 
                grafemas: { 
                    'i': [
                        { html: 'f<span class="resaltado">i</span>sh', textolimpio: 'fish' }, { html: 'p<span class="resaltado">i</span>n', textolimpio: 'pin' },
                        { html: 's<span class="resaltado">i</span>t', textolimpio: 'sit' }, { html: 'k<span class="resaltado">i</span>ck', textolimpio: 'kick' },
                        { html: 'l<span class="resaltado">i</span>p', textolimpio: 'lip' }, { html: 'm<span class="resaltado">i</span>lk', textolimpio: 'milk' },
                        { html: 'w<span class="resaltado">i</span>nd', textolimpio: 'wind' }, { html: 'r<span class="resaltado">i</span>ng', textolimpio: 'ring' },
                        { html: 's<span class="resaltado">i</span>ng', textolimpio: 'sing' }, { html: 'h<span class="resaltado">i</span>t', textolimpio: 'hit' },
                        { html: 'l<span class="resaltado">i</span>ft', textolimpio: 'lift' }, { html: 'p<span class="resaltado">i</span>ll', textolimpio: 'pill' },
                        { html: 'w<span class="resaltado">i</span>sh', textolimpio: 'wish' }, { html: 'm<span class="resaltado">i</span>ss', textolimpio: 'miss' },
                        { html: 'k<span class="resaltado">i</span>ng', textolimpio: 'king' }
                    ], 
                    'y': [
                        { html: 'g<span class="resaltado">y</span>m', textolimpio: 'gym' }, { html: 's<span class="resaltado">y</span>stem', textolimpio: 'system' },
                        { html: 'cr<span class="resaltado">y</span>stal', textolimpio: 'crystal' }, { html: 'm<span class="resaltado">y</span>th', textolimpio: 'myth' },
                        { html: 'l<span class="resaltado">y</span>ric', textolimpio: 'lyric' }, { html: 's<span class="resaltado">y</span>mbol', textolimpio: 'symbol' },
                        { html: 's<span class="resaltado">y</span>mptom', textolimpio: 'symptom' }, { html: 'c<span class="resaltado">y</span>linder', textolimpio: 'cylinder' },
                        { html: 't<span class="resaltado">y</span>pical', textolimpio: 'typical' }, { html: 'p<span class="resaltado">y</span>ramid', textolimpio: 'pyramid' },
                        { html: 'ox<span class="resaltado">y</span>gen', textolimpio: 'oxygen' }, { html: 'phys<span class="resaltado">y</span>cs', textolimpio: 'physics' },
                        { html: 'myst<span class="resaltado">y</span>c', textolimpio: 'mystic' }, { html: 's<span class="resaltado">y</span>rup', textolimpio: 'syrup' },
                        { html: 'h<span class="resaltado">y</span>mnal', textolimpio: 'hymnal' }
                    ], 
                    'ui': [
                        { html: 'b<span class="resaltado">ui</span>ld', textolimpio: 'build' }, { html: 'g<span class="resaltado">ui</span>lt', textolimpio: 'guilt' },
                        { html: 'g<span class="resaltado">ui</span>tar', textolimpio: 'guitar' }, { html: 'b<span class="resaltado">ui</span>lt', textolimpio: 'built' },
                        { html: 'b<span class="resaltado">ui</span>lder', textolimpio: 'builder' }, { html: 'b<span class="resaltado">ui</span>lding', textolimpio: 'building' },
                        { html: 'g<span class="resaltado">ui</span>lty', textolimpio: 'guilty' }, { html: 'g<span class="resaltado">ui</span>ld', textolimpio: 'guild' },
                        { html: 'circ<span class="resaltado">ui</span>t', textolimpio: 'circuit' }, { html: 'g<span class="resaltado">ui</span>tars', textolimpio: 'guitars' },
                        { html: 'circ<span class="resaltado">ui</span>ts', textolimpio: 'circuits' }, { html: 'b<span class="resaltado">ui</span>ldings', textolimpio: 'buildings' },
                        { html: 'g<span class="resaltado">ui</span>ltiness', textolimpio: 'guiltiness' }, { html: 're-b<span class="resaltado">ui</span>ld', textolimpio: 'rebuild' },
                        { html: 'bis-c<span class="resaltado">ui</span>t', textolimpio: 'biscuit' }
                    ],
                    'e': [
                        { html: 'd<span class="resaltado">e</span>cide', textolimpio: 'decide' }, { html: 'b<span class="resaltado">e</span>gin', textolimpio: 'begin' },
                        { html: 'pr<span class="resaltado">e</span>tty', textolimpio: 'pretty' }, { html: 'd<span class="resaltado">e</span>fend', textolimpio: 'defend' },
                        { html: 'b<span class="resaltado">e</span>fore', textolimpio: 'before' }, { html: 'd<span class="resaltado">e</span>gree', textolimpio: 'degree' },
                        { html: 'd<span class="resaltado">e</span>lay', textolimpio: 'delay' }, { html: 'd<span class="resaltado">e</span>pend', textolimpio: 'depend' },
                        { html: 'd<span class="resaltado">e</span>sire', textolimpio: 'desire' }, { html: 'd<span class="resaltado">e</span>tect', textolimpio: 'detect' },
                        { html: 'd<span class="resaltado">e</span>vice', textolimpio: 'device' }, { html: 'b<span class="resaltado">e</span>tween', textolimpio: 'between' },
                        { html: 'b<span class="resaltado">e</span>have', textolimpio: 'behave' }, { html: 'b<span class="resaltado">e</span>hind', textolimpio: 'behind' },
                        { html: 'b<span class="resaltado">e</span>lieve', textolimpio: 'believe' }
                    ],
                    'a': [
                        { html: 'dam<span class="resaltado">a</span>ge', textolimpio: 'damage' }, { html: 'vill<span class="resaltado">a</span>ge', textolimpio: 'village' },
                        { html: 'man<span class="resaltado">a</span>ge', textolimpio: 'manage' }, { html: 'garb<span class="resaltado">a</span>ge', textolimpio: 'garbage' },
                        { html: 'pack<span class="resaltado">a</span>ge', textolimpio: 'package' }, { html: 'bagg<span class="resaltado">a</span>ge', textolimpio: 'baggage' },
                        { html: 'lugg<span class="resaltado">a</span>ge', textolimpio: 'luggage' }, { html: 'band<span class="resaltado">a</span>ge', textolimpio: 'bandage' },
                        { html: 'cour<span class="resaltado">a</span>ge', textolimpio: 'courage' }, { html: 'stor<span class="resaltado">a</span>ge', textolimpio: 'storage' },
                        { html: 'cott<span class="resaltado">a</span>ge', textolimpio: 'cottage' }, { html: 'saus<span class="resaltado">a</span>ge', textolimpio: 'sausage' },
                        { html: 'advant<span class="resaltado">a</span>ge', textolimpio: 'advantage' }, { html: 'mess<span class="resaltado">a</span>ge', textolimpio: 'message' },
                        { html: 'pass<span class="resaltado">a</span>ge', textolimpio: 'passage' }
                    ]
                } 
            },
            { 
                simbolo: '/æ/', tipo: 'SHORT VOWEL', textoAudioAislado: 'ah', 
                grafemas: { 
                    'a': [
                        { html: 'c<span class="resaltado">a</span>t', textolimpio: 'cat' }, { html: 'm<span class="resaltado">a</span>p', textolimpio: 'map' }, { html: 'b<span class="resaltado">a</span>d', textolimpio: 'bad' },
                        { html: 'h<span class="resaltado">a</span>t', textolimpio: 'hat' }, { html: 'b<span class="resaltado">a</span>g', textolimpio: 'bag' }, { html: 'p<span class="resaltado">a</span>d', textolimpio: 'pad' },
                        { html: 'f<span class="resaltado">a</span>n', textolimpio: 'fan' }, { html: 'm<span class="resaltado">a</span>n', textolimpio: 'man' }, { html: 'h<span class="resaltado">a</span>nd', textolimpio: 'hand' },
                        { html: 'st<span class="resaltado">a</span>nd', textolimpio: 'stand' }, { html: 'f<span class="resaltado">a</span>st', textolimpio: 'fast' }, { html: 'l<span class="resaltado">a</span>st', textolimpio: 'last' },
                        { html: 'p<span class="resaltado">a</span>st', textolimpio: 'past' }, { html: 'cl<span class="resaltado">a</span>ss', textolimpio: 'class' }, { html: 'g<span class="resaltado">a</span>s', textolimpio: 'gas' }
                    ],
                    'au': [
                        { html: 'l<span class="resaltado">au</span>gh', textolimpio: 'laugh' }, { html: 'l<span class="resaltado">au</span>ghed', textolimpio: 'laughed' }, 
                        { html: 'l<span class="resaltado">au</span>ghing', textolimpio: 'laughing' }, { html: 'l<span class="resaltado">au</span>ghter', textolimpio: 'laughter' }, 
                        { html: 'l<span class="resaltado">au</span>ghable', textolimpio: 'laughable' }, { html: 'dr<span class="resaltado">au</span>ght', textolimpio: 'draught' }
                    ]
                } 
            },
            {
                simbolo: '/ɛ/', tipo: 'SHORT VOWEL', textoAudioAislado: 'eh',
                grafemas: {
                    'e': [
                        { html: 'b<span class="resaltado">e</span>d', textolimpio: 'bed' }, { html: 'r<span class="resaltado">e</span>d', textolimpio: 'red' }, { html: 'p<span class="resaltado">e</span>n', textolimpio: 'pen' },
                        { html: 't<span class="resaltado">e</span>nt', textolimpio: 'tent' }, { html: 'l<span class="resaltado">e</span>g', textolimpio: 'leg' }, { html: 'n<span class="resaltado">e</span>st', textolimpio: 'nest' },
                        { html: 'm<span class="resaltado">e</span>n', textolimpio: 'men' }, { html: 'h<span class="resaltado">e</span>n', textolimpio: 'hen' }, { html: 'w<span class="resaltado">e</span>t', textolimpio: 'wet' },
                        { html: 'g<span class="resaltado">e</span>t', textolimpio: 'get' }, { html: 's<span class="resaltado">e</span>nd', textolimpio: 'send' }, { html: 'b<span class="resaltado">e</span>st', textolimpio: 'best' },
                        { html: 'n<span class="resaltado">e</span>xt', textolimpio: 'next' }, { html: 'h<span class="resaltado">ea</span>vy', textolimpio: 'heavy' }, { html: 'd<span class="resaltado">e</span>sk', textolimpio: 'desk' }
                    ],
                    'ea': [
                        { html: 'h<span class="resaltado">ea</span>d', textolimpio: 'head' }, { html: 'br<span class="resaltado">ea</span>bread', textolimpio: 'bread' }, { html: 'd<span class="resaltado">ea</span>f', textolimpio: 'deaf' },
                        { html: 'd<span class="resaltado">ea</span>th', textolimpio: 'death' }, { html: 'r<span class="resaltado">ea</span>dy', textolimpio: 'ready' }, { html: 'h<span class="resaltado">ea</span>lth', textolimpio: 'health' },
                        { html: 'w<span class="resaltado">ea</span>lth', textolimpio: 'wealth' }, { html: 'f<span class="resaltado">ea</span>ther', textolimpio: 'feather' }, { html: 'l<span class="resaltado">ea</span>ther', textolimpio: 'leather' },
                        { html: 'w<span class="resaltado">ea</span>ther', textolimpio: 'weather' }, { html: 'h<span class="resaltado">ea</span>vy', textolimpio: 'heavy' }, { html: 'thr<span class="resaltado">ea</span>d', textolimpio: 'thread' },
                        { html: 'sw<span class="resaltado">ea</span>ter', textolimpio: 'sweater' }, { html: 'br<span class="resaltado">ea</span>kfast', textolimpio: 'breakfast' }, { html: 'st<span class="resaltado">ea</span>dy', textolimpio: 'steady' }
                    ]
                }
            },
            {
                simbolo: '/ʊ/', tipo: 'SHORT VOWEL', textoAudioAislado: 'uuh',
                grafemas: {
                    'oo': [
                        { html: 'b<span class="resaltado">oo</span>k', textolimpio: 'book' }, { html: 'f<span class="resaltado">oo</span>t', textolimpio: 'foot' }, { html: 'g<span class="resaltado">oo</span>d', textolimpio: 'good' },
                        { html: 'w<span class="resaltado">oo</span>d', textolimpio: 'wood' }, { html: 'c<span class="resaltado">oo</span>k', textolimpio: 'cook' }, { html: 'h<span class="resaltado">oo</span>k', textolimpio: 'hook' },
                        { html: 'l<span class="resaltado">oo</span>k', textolimpio: 'look' }, { html: 't<span class="resaltado">oo</span>k', textolimpio: 'took' }, { html: 'sh<span class="resaltado">oo</span>k', textolimpio: 'shook' },
                        { html: 'w<span class="resaltado">oo</span>l', textolimpio: 'wool' }, { html: 'h<span class="resaltado">oo</span>d', textolimpio: 'hood' }, { html: 'br<span class="resaltado">oo</span>k', textolimpio: 'brook' },
                        { html: 'cr<span class="resaltado">oo</span>k', textolimpio: 'crook' }, { html: 'st<span class="resaltado">oo</span>d', textolimpio: 'stood' }, { html: 's<span class="resaltado">oo</span>t', textolimpio: 'soot' }
                    ],
                    'u': [
                        { html: 'p<span class="resaltado">u</span>ll', textolimpio: 'pull' }, { html: 'p<span class="resaltado">u</span>sh', textolimpio: 'push' }, { html: 'f<span class="resaltado">u</span>ll', textolimpio: 'full' },
                        { html: 'b<span class="resaltado">u</span>ll', textolimpio: 'bull' }, { html: 'b<span class="resaltado">u</span>sh', textolimpio: 'bush' }, { html: 'p<span class="resaltado">u</span>t', textolimpio: 'put' },
                        { html: 'p<span class="resaltado">u</span>dding', textolimpio: 'pudding' }, { html: 'b<span class="resaltado">u</span>tcher', textolimpio: 'butcher' }, { html: 'b<span class="resaltado">u</span>llet', textolimpio: 'bullet' },
                        { html: 'p<span class="resaltado">u</span>lpit', textolimpio: 'pulpit' }, { html: 'f<span class="resaltado">u</span>llback', textolimpio: 'fullback' }, { html: 'p<span class="resaltado">u</span>lley', textolimpio: 'pulley' },
                        { html: 'b<span class="resaltado">u</span>lly', textolimpio: 'bully' }, { html: 'c<span class="resaltado">u</span>shion', textolimpio: 'cushion' }, { html: 's<span class="resaltado">u</span>gar', textolimpio: 'sugar' }
                    ]
                }
            },
            {
                simbolo: '/ʌ/', tipo: 'SHORT VOWEL', textoAudioAislado: 'uh',
                grafemas: {
                    'u': [
                        { html: 'c<span class="resaltado">u</span>p', textolimpio: 'cup' }, { html: 'b<span class="resaltado">u</span>s', textolimpio: 'bus' }, { html: 'g<span class="resaltado">u</span>m', textolimpio: 'gum' },
                        { html: 's<span class="resaltado">u</span>n', textolimpio: 'sun' }, { html: 'm<span class="resaltado">u</span>d', textolimpio: 'mud' }, { html: 'c<span class="resaltado">u</span>t', textolimpio: 'cut' },
                        { html: 'n<span class="resaltado">u</span>t', textolimpio: 'nut' }, { html: 'r<span class="resaltado">u</span>g', textolimpio: 'rug' }, { html: 'd<span class="resaltado">u</span>ck', textolimpio: 'duck' },
                        { html: 'j<span class="resaltado">u</span>mp', textolimpio: 'jump' }, { html: 'r<span class="resaltado">u</span>n', textolimpio: 'run' }, { html: 'h<span class="resaltado">u</span>g', textolimpio: 'hug' },
                        { html: 't<span class="resaltado">u</span>b', textolimpio: 'tub' }, { html: 'p<span class="resaltado">u</span>ppy', textolimpio: 'puppy' }, { html: 'l<span class="resaltado">u</span>nch', textolimpio: 'lunch' }
                    ],
                    'o': [
                        { html: 's<span class="resaltado">o</span>n', textolimpio: 'son' }, { html: 'w<span class="resaltado">o</span>n', textolimpio: 'won' }, { html: 'l<span class="resaltado">o</span>ve', textolimpio: 'love' },
                        { html: 'd<span class="resaltado">o</span>ne', textolimpio: 'done' }, { html: 'c<span class="resaltado">o</span>me', textolimpio: 'come' }, { html: 'm<span class="resaltado">o</span>nth', textolimpio: 'month' },
                        { html: 'm<span class="resaltado">o</span>ney', textolimpio: 'money' }, { html: 'm<span class="resaltado">o</span>nkey', textolimpio: 'monkey' }, { html: 'g<span class="resaltado">o</span>vern', textolimpio: 'govern' },
                        { html: 'h<span class="resaltado">o</span>ney', textolimpio: 'honey' }, { html: 'd<span class="resaltado">o</span>ve', textolimpio: 'dove' }, { html: 'gl<span class="resaltado">o</span>ve', textolimpio: 'glove' },
                        { html: 'sh<span class="resaltado">o</span>ve', textolimpio: 'shove' }, { html: 'sp<span class="resaltado">o</span>nge', textolimpio: 'sponge' }, { html: 't<span class="resaltado">o</span>ngue', textolimpio: 'tongue' }
                    ]
                }
            },
            {
                simbolo: '/ɒ/', tipo: 'SHORT VOWEL', textoAudioAislado: 'ox',
                grafemas: {
                    'o': [
                        { html: 'h<span class="resaltado">o</span>t', textolimpio: 'hot' }, { html: 'n<span class="resaltado">o</span>t', textolimpio: 'not' }, { html: 'f<span class="resaltado">o</span>x', textolimpio: 'fox' },
                        { html: 'b<span class="resaltado">o</span>x', textolimpio: 'box' }, { html: 't<span class="resaltado">o</span>p', textolimpio: 'top' }, { html: 'p<span class="resaltado">o</span>t', textolimpio: 'pot' },
                        { html: 'm<span class="resaltado">o</span>p', textolimpio: 'mop' }, { html: 'r<span class="resaltado">o</span>ck', textolimpio: 'rock' }, { html: 's<span class="resaltado">o</span>ck', textolimpio: 'sock' },
                        { html: 'l<span class="resaltado">o</span>ck', textolimpio: 'lock' }, { html: 'sh<span class="resaltado">o</span>p', textolimpio: 'shop' }, { html: 'd<span class="resaltado">o</span>g', textolimpio: 'dog' },
                        { html: 'l<span class="resaltado">o</span>g', textolimpio: 'log' }, { html: 'f<span class="resaltado">o</span>g', textolimpio: 'fog' }, { html: 'j<span class="resaltado">o</span>b', textolimpio: 'job' }
                    ],
                    'a': [
                        { html: 'w<span class="resaltado">a</span>nt', textolimpio: 'want' }, { html: 'w<span class="resaltado">a</span>sh', textolimpio: 'wash' }, { html: 'w<span class="resaltado">a</span>tch', textolimpio: 'watch' },
                        { html: 'w<span class="resaltado">a</span>nd', textolimpio: 'wand' }, { html: 'sw<span class="resaltado">a</span>n', textolimpio: 'swan' }, { html: 'w<span class="resaltado">a</span>sp', textolimpio: 'wasp' },
                        { html: 'sw<span class="resaltado">a</span>mp', textolimpio: 'swamp' }, { html: 'qu<span class="resaltado">a</span>lity', textolimpio: 'quality' }, { html: 'qu<span class="resaltado">a</span>ntity', textolimpio: 'quantity' },
                        { html: 'w<span class="resaltado">a</span>llet', textolimpio: 'wallet' }, { html: 'w<span class="resaltado">a</span>llow', textolimpio: 'wallow' }, { html: 'w<span class="resaltado">a</span>lrus', textolimpio: 'walrus' },
                        { html: 'squ<span class="resaltado">a</span>d', textolimpio: 'squad' }, { html: 'squ<span class="resaltado">a</span>sh', textolimpio: 'squash' }, { html: 'w<span class="resaltado">a</span>ffle', textolimpio: 'waffle' }
                    ]
                }
            },
            {
                simbolo: '/ə/', tipo: 'SCHWA VOWEL', textoAudioAislado: 'uh',
                grafemas: {
                    'a': [
                        { html: '<span class="resaltado">a</span>bout', textolimpio: 'about' }, { html: 'b<span class="resaltado">a</span>nan<span class="resaltado">a</span>', textolimpio: 'banana' }, { html: '<span class="resaltado">a</span>gree', textolimpio: 'agree' },
                        { html: '<span class="resaltado">a</span>lone', textolimpio: 'alone' }, { html: '<span class="resaltado">a</span>fraid', textolimpio: 'afraid' }, { html: '<span class="resaltado">a</span>bove', textolimpio: 'above' },
                        { html: '<span class="resaltado">a</span>bility', textolimpio: 'ability' }, { html: '<span class="resaltado">a</span>dult', textolimpio: 'adult' }, { html: 'sof<span class="resaltado">a</span>', textolimpio: 'sofa' },
                        { html: 'americ<span class="resaltado">a</span>', textolimpio: 'america' }, { html: 'chin<span class="resaltado">a</span>', textolimpio: 'china' }, { html: 'zebr<span class="resaltado">a</span>', textolimpio: 'zebra' },
                        { html: 'camer<span class="resaltado">a</span>', textolimpio: 'camera' }, { html: 'ide<span class="resaltado">a</span>', textolimpio: 'idea' }, { html: 'dat<span class="resaltado">a</span>', textolimpio: 'data' }
                    ],
                    'e': [
                        { html: 'op<span class="resaltado">e</span>n', textolimpio: 'open' }, { html: 'ev<span class="resaltado">e</span>ry', textolimpio: 'every' }, { html: 'bak<span class="resaltado">e</span>r', textolimpio: 'baker' },
                        { html: 'par<span class="resaltado">e</span>nt', textolimpio: 'parent' }, { html: 'stud<span class="resaltado">e</span>nt', textolimpio: 'student' }, { html: 'sil<span class="resaltado">e</span>nt', textolimpio: 'silent' },
                        { html: 'presid<span class="resaltado">e</span>nt', textolimpio: 'president' }, { html: 'elem<span class="resaltado">e</span>nt', textolimpio: 'element' }, { html: 'reduc<span class="resaltado">e</span>', textolimpio: 'reduce' },
                        { html: 'probl<span class="resaltado">e</span>m', textolimpio: 'problem' }, { html: 'viol<span class="resaltado">e</span>nt', textolimpio: 'violent' }, { html: 'rec<span class="resaltado">e</span>nt', textolimpio: 'recent' },
                        { html: 'curr<span class="resaltado">e</span>nt', textolimpio: 'current' }, { html: 'differ<span class="resaltado">e</span>nt', textolimpio: 'different' }, { html: 'gall<span class="resaltado">e</span>ry', textolimpio: 'gallery' }
                    ]
                }
            }
        ]
    };

    // Variables de estado interno de la app de fonemas
    let listaFonemasActivos = baseDatosCategorias['vocales_cortas'];
    let indiceCarruselActual = 0;
    let grafemaSeleccionadoActual = '';
    let indicesPalabras = {};
    let palabraSeleccionadaTexto = '';

    // Motores de reproducción de audio por síntesis de voz (Web Speech API)
    window.reproducirTextoVoz = (texto) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const lectura = new SpeechSynthesisUtterance(texto);
        lectura.lang = 'en-US';
        lectura.rate = 0.85;
        window.speechSynthesis.speak(lectura);
    };

    window.reproducirFonema = () => {
        const fonemaObj = listaFonemasActivos?.[indiceCarruselActual];
        if (fonemaObj) window.reproducirTextoVoz(fonemaObj.textoAudioAislado);
    };

    window.reproducirPalabra = () => {
        if (palabraSeleccionadaTexto) window.reproducirTextoVoz(palabraSeleccionadaTexto);
    };

    window.cambiarCategoria = (categoriaKey) => {
        listaFonemasActivos = baseDatosCategorias[categoriaKey];
        indiceCarruselActual = 0;
        window.inicializarInterfazFonema();
    };

    window.navegarCarrusel = (direccion) => {
        if (!listaFonemasActivos || listaFonemasActivos.length <= 1) return;
        indiceCarruselActual = (indiceCarruselActual + direccion + listaFonemasActivos.length) % listaFonemasActivos.length;
        window.inicializarInterfazFonema();
    };

    window.inicializarInterfazFonema = () => {
        const refs = {
            vg: document.getElementById('visualFonema'),
            cp: document.getElementById('contenedorPalabra'),
            cg: document.getElementById('contenedorGrafemas'),
            ts: document.getElementById('textoTipoSonido'),
            ci: document.getElementById('contadorIndice'),
            tp: document.getElementById('totalPalabras')
        };

        if (!refs.vg || !refs.cp || !refs.cg) return;

        if (!listaFonemasActivos || listaFonemasActivos.length === 0) {
            refs.vg.innerText = '---';
            if (refs.ts) refs.ts.innerText = 'PRÓXIMAMENTE';
            refs.cp.innerHTML = '---';
            refs.cg.innerHTML = '';
            if (refs.ci) refs.ci.innerText = '0';
            if (refs.tp) refs.tp.innerText = '0';
            palabraSeleccionadaTexto = '';
            return;
        }

        const fonemaObj = listaFonemasActivos[indiceCarruselActual];
        refs.vg.innerText = fonemaObj.simbolo;
        if (refs.ts) refs.ts.innerText = fonemaObj.tipo;

        indicesPalabras = {};
        const listaGrafemas = Object.keys(fonemaObj.grafemas);
        listaGrafemas.forEach(g => indicesPalabras[g] = 0);

        // Se corrige el bug original asignando la primera cadena de texto válida, no el array completo
        grafemaSeleccionadoActual = listaGrafemas[0];
        renderizarBotonesGrafemas(listaGrafemas);
        mostrarPalabra(grafemaSeleccionadoActual);
    };

    function renderizarBotonesGrafemas(listaGrafemas) {
        const contenedor = document.getElementById('contenedorGrafemas');
        if (!contenedor) return;
        contenedor.innerHTML = '';

        listaGrafemas.forEach(grafema => {
            const boton = document.createElement('button');
            boton.className = `btn-grafema ${grafema === grafemaSeleccionadoActual ? 'activo' : ''}`;
            boton.innerText = grafema;
            boton.onclick = () => {
                if (grafemaSeleccionadoActual === grafema) {
                    const total = listaFonemasActivos[indiceCarruselActual].grafemas[grafema].length;
                    indicesPalabras[grafema] = (indicesPalabras[grafema] + 1) % total;
                } else {
                    grafemaSeleccionadoActual = grafema;
                }
                mostrarPalabra(grafemaSeleccionadoActual);
                document.querySelectorAll('.btn-grafema').forEach(b => b.classList.toggle('activo', b.innerText === grafemaSeleccionadoActual));
            };
            contenedor.appendChild(boton);
        });
    }

    function mostrarPalabra(grafema) {
        const fonemaObj = listaFonemasActivos?.[indiceCarruselActual];
        const listaPalabras = fonemaObj?.grafemas?.[grafema];
        if (!listaPalabras) return;

        const indiceActual = indicesPalabras[grafema];
        const palabraObj = listaPalabras[indiceActual];

        palabraSeleccionadaTexto = palabraObj.textolimpio;

        const cp = document.getElementById('contenedorPalabra');
        if (cp) cp.innerHTML = palabraObj.html;

        const ci = document.getElementById('contadorIndice');
        if (ci) ci.innerText = indiceActual + 1;

        const tp = document.getElementById('totalPalabras');
        if (tp) tp.innerText = listaPalabras.length;

        window.reproducirPalabra();
    }
});

// ==========================================
// 3. GENERACIÓN DE TABLAS DE FONEMAS (Lecciones 2 y 3)
// ==========================================
function renderizarTablaPorTipo(tipoFiltro) {
    const URL_BASE = `https://raw.githubusercontent.com/vecrecemosmx-cyber/phonemes/main/`;
    const lista42Fonemas = [
        { simbolo: "i:", archivo: "PHONEME-GREEN.mp3", ejemplo: "green", tipo: "vocal" },
        { simbolo: "ɪ", archivo: "PHONEME-PINK.mp3", ejemplo: "pink", tipo: "vocal" },
        { simbolo: "ʊ", archivo: "PHONEME-WOOD.mp3", ejemplo: "wood", tipo: "vocal" },
        { simbolo: "u:", archivo: "PHONEME-BLUE.mp3", ejemplo: "blue", tipo: "vocal" },
        { simbolo: "e", archivo: "PHONEME-RED.mp3", ejemplo: "red", tipo: "vocal" },
        { simbolo: "ə", archivo: "PHONEME-DUST.mp3", ejemplo: "dust", tipo: "vocal" },
        { simbolo: "ɜ:r", archivo: "PHONEME-BIRD.mp3", ejemplo: "bird", tipo: "vocal" },
        { simbolo: "ɔ:", archivo: "PHONEME-MAUVE.mp3", ejemplo: "mauve", tipo: "vocal" },
        { simbolo: "æ", archivo: "PHONEME-SAND.mp3", ejemplo: "sand", tipo: "vocal" },
        { simbolo: "ʌ", archivo: "PHONEME-CUP.mp3", ejemplo: "cup", tipo: "vocal" },
        { simbolo: "ɑ:", archivo: "PHONEME-COFFEE.mp3", ejemplo: "coffee", tipo: "vocal" },
        { simbolo: "ɒ", archivo: "PHONEME-POT.mp3", ejemplo: "pot", tipo: "vocal" },
        { simbolo: "eɪ", archivo: "PHONEME-BAY.mp3", ejemplo: "bay", tipo: "vocal" },
        { simbolo: "aɪ", archivo: "PHONEME-LIME.mp3", ejemplo: "lime", tipo: "vocal" },
        { simbolo: "ɔɪ", archivo: "PHONEME-TURQUOISE.mp3", ejemplo: "boy", tipo: "vocal" },
        { simbolo: "aʊ", archivo: "PHONEME-BROWN.mp3", ejemplo: "brown", tipo: "vocal" },
        { simbolo: "oʊ", archivo: "PHONEME-GOLD.mp3", ejemplo: "gold", tipo: "vocal" },
        { simbolo: "ɪə", archivo: "PHONEME-NEAR.mp3", ejemplo: "near", tipo: "vocal" },
        { simbolo: "p", archivo: "PHONEME-PIG.mp3", ejemplo: "pig", tipo: "consonante" },
        { simbolo: "b", archivo: "PHONEME-BEAR.mp3", ejemplo: "bear", tipo: "consonante" },
        { simbolo: "t", archivo: "PHONEME-TURTLE.mp3", ejemplo: "turtle", tipo: "consonante" },
        { simbolo: "d", archivo: "PHONEME-DOG.mp3", ejemplo: "dog", tipo: "consonante" },
        { simbolo: "k", archivo: "PHONEME-CAT.mp3", ejemplo: "cat", tipo: "consonante" },
        { simbolo: "g", archivo: "PHONEME-GOAT.mp3", ejemplo: "goat", tipo: "consonante" },
        { simbolo: "f", archivo: "PHONEME-FROG.mp3", ejemplo: "frog", tipo: "consonante" },
        { simbolo: "v", archivo: "PHONEME-BEAVER.mp3", ejemplo: "beaver", tipo: "consonante" },
        { simbolo: "θ", archivo: "PHONEME-PANTHER.mp3", ejemplo: "panther", tipo: "consonante" },
        { simbolo: "ð", archivo: "PHONEME-FEATHER.mp3", ejemplo: "feather", tipo: "consonante" },
        { simbolo: "s", archivo: "PHONEME-SNAKE.mp3", ejemplo: "snake", tipo: "consonante" },
        { simbolo: "z", archivo: "PHONEME-ZEBRA.mp3", ejemplo: "zebra", tipo: "consonante" },
        { simbolo: "ʃ", archivo: "PHONEME-SHEEP.mp3", ejemplo: "sheep", tipo: "consonante" },
        { simbolo: "ʒ", archivo: "PHONEME-TELEVISION.mp3", ejemplo: "television", tipo: "consonante" },
        { simbolo: "tʃ", archivo: "PHONEME-CHICKEN.mp3", ejemplo: "chicken", tipo: "consonante" },
        { simbolo: "dʒ", archivo: "PHONEME-GIRAFFE.mp3", ejemplo: "giraffe", tipo: "consonante" },
        { simbolo: "h", archivo: "PHONEME-HORSE.mp3", ejemplo: "horse", tipo: "consonante" },
        { simbolo: "m", archivo: "PHONEME-MOUSE.mp3", ejemplo: "mouse", tipo: "consonante" },
        { simbolo: "n", archivo: "PHONEME-DINOSAUR.mp3", ejemplo: "dinosaur", tipo: "consonante" },
        { simbolo: "ŋ", archivo: "PHONEME-PENGUIN.mp3", ejemplo: "penguin", tipo: "consonante" },
        { simbolo: "l", archivo: "PHONEME-LION.mp3", ejemplo: "lion", tipo: "consonante" },
        { simbolo: "r", archivo: "PHONEME-RABBIT.mp3", ejemplo: "rabbit", tipo: "consonante" },
        { simbolo: "w", archivo: "PHONEME-WOLF.mp3", ejemplo: "wolf", tipo: "consonante" },
        { simbolo: "j", archivo: "PHONEME-YAK.mp3", ejemplo: "yak", tipo: "consonante" }
    ];

    if (!window.audioTablaReal) window.audioTablaReal = null;
    const tablaContenedor = document.getElementById('tabla-fonemas-dinamica');
    if (!tablaContenedor) return;

    tablaContenedor.innerHTML = '';

    lista42Fonemas.filter(f => f.tipo === tipoFiltro).forEach(f => {
        const botonF = document.createElement('button');
        botonF.className = `btn-fonema-tabla ${f.tipo}`;
        botonF.innerHTML = `<span class="simbolo-u">/${f.simbolo}/</span><span class="ejemplo-u">${f.ejemplo}</span>`;
        
        // CORRECCIÓN: Volvemos a la estructura de fallback explícito nativo que respeta el flujo de hilos del navegador
        function intentarReproducir(nombreArchivo) {
            const urlMinuscula = URL_BASE + nombreArchivo;
            const urlMayuscula = URL_BASE + nombreArchivo.replace('.mp3', '.MP3');
            const urlTodoMinuscula = URL_BASE + nombreArchivo.toLowerCase();

            window.audioTablaReal = new Audio();
            window.audioTablaReal.crossOrigin = "anonymous";
            window.audioTablaReal.src = urlMinuscula;

            window.audioTablaReal.play().catch(() => {
                window.audioTablaReal.src = urlMayuscula;
                window.audioTablaReal.play().catch(() => {
                    window.audioTablaReal.src = urlTodoMinuscula;
                    window.audioTablaReal.play().catch(err => {
                        console.error(`🚨 Falló audio de /${f.simbolo}/ en ruta:\n👉 ${urlMinuscula}`, err);
                        botonF.classList.remove('reproduciendo-audio');
                    });
                });
            });

            window.audioTablaReal.onended = () => {
                botonF.classList.remove('reproduciendo-audio');
            };
        }

        botonF.addEventListener('click', () => {
            if (window.audioTablaReal) {
                window.audioTablaReal.pause();
                document.querySelectorAll('.btn-fonema-tabla').forEach(b => b.classList.remove('reproduciendo-audio'));
            }

            botonF.classList.add('reproduciendo-audio');
            intentarReproducir(f.archivo);
        });

        tablaContenedor.appendChild(botonF);
    });
}
