// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import {
//   createBrowserRouter,
//   RouterProvider,
//   Route,
//   Link,
// } from 'react-router-dom';
// import Home from './pages/Home';
// import Login from './pages/Login';

// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <Login/>,
//   },
//   {
//     path: 'home',
//     element: <Home />,
//   },
// ]);

// const App = () => {
//   return (
//     <RouterProvider router={router} />
//   );
// };

// const rootElement = document.getElementById('root');
// createRoot(rootElement).render(<App />);

// export default App;



import React from 'react';
// import { HashRouter as Router } from 'react-router-dom';
// import './dx-styles.scss';
import LoadPanel from 'devextreme-react/load-panel';
import { NavigationProvider } from './contexts/navigation';
import { AuthProvider, useAuth } from './contexts/auth';
// import { useScreenSizeClass } from './utils/media-query';
import Content from './Content';
import UnauthenticatedContent from './UnauthenticatedContent';
import { BrowserRouter } from 'react-router-dom';

function App() {
  const { user, loading } = useAuth();

  // if (loading) {
  //   return <LoadPanel visible={true} />;
  // }

  if (user) {
    return <Content />;
  }

  return <UnauthenticatedContent />;
}

export default function Root() {
  // const screenSizeClass = useScreenSizeClass();

  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <div>
            <App />
          </div>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


