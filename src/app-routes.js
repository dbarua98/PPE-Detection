// import { HomePage, TasksPage, ProfilePage } from './pages';
import { withNavigationWatcher } from './contexts/navigation';
import Login from './pages/Login';
import Home from './pages/Home';

const routes = [
    {
        path: '/home',
        element: Home
    }
];

export default routes.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});
