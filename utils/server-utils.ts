

export const closeServer = async (server: any): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (!server) {
            console.log('Server is not initialized, skipping shutdown.');
            return resolve();
        }
        server.close((err: any) => {
            if (err) {
                console.error('Error shutting down the Express server:', err);
                return reject(err);
            }
            console.log('Express server closed');
            resolve();
        });
    });
};
