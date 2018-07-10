import Content from '../components/Content/Content';
import Request from '../components/Request/Request';
import Credentials from '../components/Credentials/Credentials';
import Email from '../components/Email/Email';


// import { Content } from "../components/common/Loadable/index";
// import { Request } from "../components/common/Loadable/index";
// import { Email } from "../components/common/Loadable/index";
// import { Credentials } from "../components/common/Loadable/index";
// import { AppTransition } from "../components/common/Loadable/index";
import NotFoundPage from '../components/404/404';

export default [
    {
        path: '/',
        exact: true,
        component: Content
    },
    {
        path: '/request',
        component: Request
    },
    {
        path: '/email/unsubscribing/:userID/:emailCancelToken',
        component: Email
    },
    // {
    //     path: '/redirect',
    //     component: AppTransition
    // },
    {
        path: '/credentials',
        component: Credentials
    },
    // {
    //     path: '/*',
    //     component: NotFoundPage
    // },
]