const noFound = () => {
    return (
        <div className="not-found-page"
             style={{
                 width: '100%',
                 display: 'flex',
                 alignItems: 'center',
                 flexDirection: 'column',
                 zIndex: 100,
                 height: '100vh',
                 backgroundColor: 'white',
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 paddingTop: '20%'
             }}>
            <h2>Page not found</h2>
            <h1>404 Error</h1>
        </div>
    );
};

export default noFound;