// Type definitions for global objects

// Extend Window interface to include gapi and google
interface Window {
  gapi?: {
    load: (api: string, callback: { callback: () => void, onerror: (error: any) => void }) => void;
    client?: {
      init: (config: any) => Promise<void>;
      getToken: () => any;
      setToken: (token: any) => void;
      calendar?: {
        events: {
          list: (params: any) => Promise<any>;
          insert: (params: any) => Promise<any>;
          delete: (params: any) => Promise<any>;
          update: (params: any) => Promise<any>;
        }
      }
    }
  };
  google?: {
    accounts?: {
      oauth2?: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (tokenResponse: any) => void;
          error_callback?: (error: any) => void;
        }) => {
          requestAccessToken: (options?: { prompt?: string }) => void;
        };
        revoke: (token: string, callback?: () => void) => void;
      };
      id?: {
        initialize: (config: any) => void;
        renderButton: (element: HTMLElement, options: any) => void;
      };
    };
  };
}