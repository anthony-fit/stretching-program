const ONBOARDING_KEY = 'StretchingPro_OnboardingState';

export interface OnboardingState {
  hasCompletedFirstSession: boolean;
  hasCompletedFirstRecovery: boolean;
  onboardingPathwayPref: 'Guided' | 'Minimalist';
}

export const adaptiveOnboardingService = {
  getOnboardingState(): OnboardingState {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) {
      return {
        hasCompletedFirstSession: false,
        hasCompletedFirstRecovery: false,
        onboardingPathwayPref: 'Guided'
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        hasCompletedFirstSession: false,
        hasCompletedFirstRecovery: false,
        onboardingPathwayPref: 'Guided'
      };
    }
  },

  markSessionCompleted() {
    const state = this.getOnboardingState();
    if (!state.hasCompletedFirstSession) {
      state.hasCompletedFirstSession = true;
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    }
  },
  
  markRecoveryCompleted() {
    const state = this.getOnboardingState();
    if (!state.hasCompletedFirstRecovery) {
      state.hasCompletedFirstRecovery = true;
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    }
  },

  setPathwayPreference(pref: 'Guided' | 'Minimalist') {
    const state = this.getOnboardingState();
    state.onboardingPathwayPref = pref;
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  }
};
