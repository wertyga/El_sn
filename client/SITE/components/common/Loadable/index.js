import Loadable from 'react-loadable';

import Loading from '../Loading/Loading';

export const Content = Loadable({
    loader: () => import('../../Content/Content'),
    loading() {
        return <Loading show={true}/>
    }
});
export const Request = Loadable({
    loader: () => import('../../Request/Request'),
    loading() {
        return <Loading show={true}/>
    }
});
export const Email = Loadable({
    loader: () => import('../../Email/Email'),
    loading() {
        return <Loading show={true}/>
    }
});
export const Credentials = Loadable({
    loader: () => import('../../Credentials/Credentials'),
    loading() {
        return <Loading show={true}/>
    }
});