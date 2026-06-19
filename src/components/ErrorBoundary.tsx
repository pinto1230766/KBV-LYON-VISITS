import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    Sentry.captureException(error, { extra: { errorInfo } });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center border border-slate-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Une erreur est survenue
            </h1>

            <p className="text-slate-500 mb-8 leading-relaxed">
              L'application a rencontré un problème inattendu. Cliquez sur "Recharger" pour tenter de reprendre.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
              >
                <RefreshCw className="w-5 h-5" />
                RECHARGER L'APPLICATION
              </button>
            </div>

            {this.state.error && (
              <div className="mt-8 pt-6 border-t border-slate-50">
                <details className="text-left">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors uppercase tracking-widest font-bold">
                    Détails techniques
                  </summary>
                  <pre className="mt-4 p-4 bg-slate-900 rounded-xl text-[10px] text-indigo-300 overflow-auto max-h-40 font-mono leading-relaxed">
                    {this.state.error.stack || this.state.error.message}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

