import { Routes, Route, Navigate } from 'react-router-dom';
// import appInfo from './app-info';
import routes from './app-routes';
// import { SideNavInnerToolbar as SideNavBarLayout } from './layouts';
// import { Footer } from './components';

export default function Content() {
  return (
      <Routes>
        {routes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
        <Route
          path='*'
          element={<Navigate to='/home' />}
        />
      </Routes>
  );
}

