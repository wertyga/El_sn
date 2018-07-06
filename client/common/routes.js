import LoginScreen from '../components/LogInScreen/LogInScreen';
import SignupPage from '../components/SignupPage/SignupPage';
import NotFound from '../components/404/404';
import SocketWrapper from '../components/SocketWrapper/SocketWrapper';

export default [
    {
        path: '/app/login',
        component: LoginScreen
    },
    {
        path: '/app/user/sign-up',
        component: SignupPage
    },
    {
        path: '/app/user/:id',
        component: SocketWrapper
    },
    {
        path: '/app/*',
        component: NotFound
    }
]