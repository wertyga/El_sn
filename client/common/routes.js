// Site
import Site from '../SITE/components/Site/Site';
import Content from '../SITE/components/Content/Content';
import Request from '../SITE/components/Request/Request';
import Credentials from '../SITE/components/Credentials/Credentials';
import Email from '../SITE/components/Email/Email';
import NotFoundPage from "../SITE/components/404/404";

// Application
import LoginScreen from '../components/LogInScreen/LogInScreen';
import SignupPage from '../components/SignupPage/SignupPage';
import NotFoundApp from '../components/404/404';
import SocketWrapper from '../components/SocketWrapper/SocketWrapper';
import Application from '../components/Application/Application';

export default [
    {
        path: '/app',
        render: () => (
            <Application />
        )
    },
    // Site
    {
        path: '/',
        render: () => (
            <Site />
        )
    },
    // {
    //     path: '/request',
    //     render: () => (
    //         <Site><Request /></Site>
    //     )
    // },
    // {
    //     path: '/email/unsubscribing/:userID/:emailCancelToken',
    //     render: () => (
    //         <Site><Email /></Site>
    //     )
    // },
    // {
    //     path: '/credentials',
    //     render: () => (
    //         <Site><Credentials /></Site>
    //     )
    // },
    // Application
    // {
    //     path: '/app/login',
    //     render: () => (
    //         <Application><LoginScreen /></Application>
    //     )
    // },
    // {
    //     path: '/app/user/sign-up',
    //     render: () => (
    //         <Application><SignupPage /></Application>
    //     )
    // },
    // {
    //     path: '/app/user/:id',
    //     render: () => (
    //         <Application><SocketWrapper /></Application>
    //     )
    // },
    // {
    //     path: '/app/*',
    //     component: NotFoundApp
    // },
    // {
    //     path: '/*',
    //     component: NotFoundPage
    // },
]