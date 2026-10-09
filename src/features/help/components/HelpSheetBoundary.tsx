import { Component } from 'react';
import type { ReactNode } from 'react';

type HelpSheetBoundaryProps = {
  onError: () => void;
  children: ReactNode;
};

type HelpSheetBoundaryState = { hasError: boolean };

// Gagal mengunduh isi panduan (mis. offline) tidak boleh menjatuhkan aplikasi ke layar error akar.
export class HelpSheetBoundary extends Component<HelpSheetBoundaryProps, HelpSheetBoundaryState> {
  state: HelpSheetBoundaryState = { hasError: false };

  static getDerivedStateFromError(): HelpSheetBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
