import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Evita que FontAwesome inyecte su CSS por JS (causa el flash de iconos gigantes)
config.autoAddCss = false;