import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Single source of truth for the nav breakpoint. Navbar (which swaps the top
// nav for a bottom bar) and App (which pads page content so the fixed bottom
// bar doesn't cover it) both read this hook so the two switches can never
// drift apart and leave a dead zone with no visible navigation.
export const MOBILE_NAV_BREAKPOINT = 768;

export default function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(MOBILE_NAV_BREAKPOINT));
}
