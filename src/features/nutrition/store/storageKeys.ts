export const STORAGE_VERSION = 1;

export const LOCAL_STORAGE_KEYS = {
  VERSION: 'stretchingpro_nutri_v1_version',
  STATE: 'stretchingpro_nutri_v1_state',
  PREFERENCES: 'stretchingpro_nutri_v1_prefs',
  ONBOARDING: 'stretchingpro_nutri_v1_onboarding'
};

export const INDEXED_DB_CONFIG = {
  NAME: 'stretchingpro_nutrition_db',
  VERSION: 1,
  STORES: {
    MEALS: 'meals',
    HYDRATION: 'hydration',
    CALORIES_BURNED: 'calories_burned',
    BODY_METRICS: 'body_metrics',
    COACHING_LOG: 'coaching_log'
  }
};
