// wrapping whole application using TCPProvider, 
// so that if you goto another screen, receiverEnd should be in background to receive

import { createContext, FC, useCallback, useContext, useState } from "react";
import { useChunkStore } from "../db/chunkStore";
import TcpSocket from 'react-native-tcp-socket';
import DeviceInfo from "react-native-device-info"

interface TCPContextType {
    server: any;
    client: any;
    isConnected: boolean;
    connectedDevice: any;
    sentFiles: any;
    receivedFiles: any;
    totalSentBytes: number;
    totalReceivedBytes: number;
    startServer: (port: number) => void;
    connectToServer: (host: string, port: number, deviceName: string) => void;
    sendMessage: (message: string | Buffer) => void;
    sendFileAck: (file: any, type: 'file' | 'image') => void;
    disconnect: () => void
}

const TCPContext = createContext<TCPContextType | undefined>(undefined)

export const useTCP = (): TCPContextType => {
    const context = useContext(TCPContext)
    if(!context){
         throw new Error('useTCP must be used within a TCPProvider')
    }
    return context
}

const options = {
    keystore: require('../../tls_certs/server-keystore.p12')
}

export const TCPProvider:FC<{children:React.ReactNode}>=({children}) => {

    // S1:Creatimg useStates for each value of TCP

    const [server, setServer] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<any>(null);
    const [serverSocket, setServerSocket] = useState<any>(null);
    const [sentFiles, setSentFiles] = useState<any>([]);
    const [receivedFiles, setReceivedFiles] = useState<any>([]);
    const [totalSentBytes, setTotalSentBytes] = useState<any>(0);
    const [totalReceivedBytes, setTotalReceivedBytes] = useState<any>(0);

    const { currentChunkSet, setCurrentChunkSet, setChunkStore } useChunkStore();

    // DISCONNECT Function
    const disconnect = useCallback(() => {
        if(client) {
            client.destroy();
        }
        if(server) {
            server.close()
        }
        setReceivedFiles([]);
        setSentFiles([]);
        setCurrentChunkSet(null);
        setTotalReceivedBytes(0);
        setChunkStore(null);
        setIsConnected(false);
    }, [client, server])

    // START SERVER
    const startServer = useCallback((port:number) => { // useCallback - to make it run only one time
        if(server){
            console.log("Server Already Running");
            return;
        }

        const newServer = TcpSocket.createTLSServer(options, (socket) => {
            console.log("Client Connceted: ", socket.address())

            // setting server socket
            setServerSocket(socket)
            socket.setNoDelay(true)
            // below lines got deprecated
            socket.readableHighWaterMark = 1024 * 1024 * 1;
            socket.writableHighWaterMark = 1024 * 1024 * 1;

            // socket event when data is received
            socket.on('data', async(data) => {
                const parsedData = JSON.parse(data?.toString());

                if(parsedData?.event === 'connect') {
                    setIsConnected(true)
                    setConnectedDevice(parsedData?.deviceName)
                }
            })

            // 
            socket.on('close', () => {
                console.log("Client Disconnected");
                setReceivedFiles([]);
                setSentFiles([]);
                setCurrentChunkSet(null);
                setTotalReceivedBytes(0)
                setChunkStore(null)
                setIsConnected(false)
                disconnect() // closing client and server completely
            })

            socket.on('error', (err) => console.log("Socket Error:", err))
        })

        newServer.listen({ port, host: '0.0.0.0' }, () => {
            const address = newServer.address();
            console.log(`Server running on ${address?.address}:${address?.port}`)
        })

        newServer.on('error', (err) => console.error('Server Error:', err))
        setServer(newServer); // will use on screens which can be accessed

    }, [server]) // it runs on start of server only hence depenedent on server only

    // START CLIENT
    const connectToServer = useCallback(
        (host: string, port: number, deviceName: string) => {
            const newClient = TcpSocket.connectTLS(
                {
                    host,
                    port,
                    cert: true,
                    ca: require('../../tls_certs/server-cart.pem')
                },
                () => {
                    setIsConnected(true);
                    setConnectedDevice(deviceName);
                    const myDeviceName = DeviceInfo.getDeviceNameSync();
                    newClient.write(
                        JSON.stringify({event: 'connect', deviceName: myDeviceName})
                    )
                }
            );

            newClient.setNoDelay(true);
            newClient.readableHighWaterMark = 1024 * 1024 * 1;
            newClient.writableHighWaterMark = 1024 * 1024 * 1;

            newClient.on('data', async data => {
                const parsedData = JSON.parse(data?.toString());
            })

            newClient.on('close', () => {
                console.log('Connection Closed');
                setReceivedFiles([]);
                setSentFiles([]);
                setCurrentChunkSet(null);
                setTotalReceivedBytes(0);
                setChunkStore(null);
                setIsConnected(false);
                disconnect();
            });

            newClient.on('error', err => {
                console.log('Client Error:', err);
            });
            setClient(newClient);
        },
        [],
    )

    return (
        <TCPContext.Provider
            value={{
                server,
                client,
                connectedDevice,
                sentFiles,
                receivedFiles,
                totalReceivedBytes,
                totalSentBytes,
                isConnected,
                startServer,
                connectToServer,
                disconnect,
                sendMessage,
                sendFileAck
            }}
        >
            {children}
        </TCPContext.Provider>
    )
}