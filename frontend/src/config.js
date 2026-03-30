/**
 * Application Configuration
 * Centralized constants used throughout the app
 */

export const CONFIG = {
  // Loading delays (milliseconds)
  CANVAS_LOADING_DELAY: 500,
  
  // Canvas/Stage defaults
  CANVAS_WIDTH: 700,
  CANVAS_HEIGHT: 480,
  
  // Zoom factors
  ZOOM_FACTOR: 1.05,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 5,
  
  // Board dimensions (cm)
  BOARD_LENGTH_CM: 240,
  BOARD_WIDTH_CM: 120,
  
  // UI layers
  MODAL_Z_INDEX: 1000,
  STICKY_Z_INDEX: 5,
  TOP_Z_INDEX: 10,
  
  // Default module properties
  DEFAULT_DRAWER_COUNT: 3,
  DEFAULT_DRAWER_HEIGHT_RATIO: 1 / 3,
  
  // Cubicación board config
  BOARD_MARGIN_CM: 0.3,
  BOARD_TYPE: 'melamina',
};

export default CONFIG;
