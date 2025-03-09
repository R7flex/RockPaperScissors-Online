import { ChakraProvider, Box, VStack, Heading, useToast } from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import io from 'socket.io-client'
import Game from './components/Game'
import Lobby from './components/Lobby'

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5
})

interface GameState {
  currentRoomId: string;
  isGameStarted: boolean;
  currentPlayers: any[];
}

function App() {
  const [nickname, setNickname] = useState('')
  const [gameState, setGameState] = useState<GameState>({
    currentRoomId: '',
    isGameStarted: false,
    currentPlayers: []
  })
  const toast = useToast()

  const resetGameState = useCallback(() => {
    setGameState({
      currentRoomId: '',
      isGameStarted: false,
      currentPlayers: []
    })
  }, [])

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket.IO bağlantısı kuruldu')
    }

    const handleDisconnect = () => {
      console.log('Socket.IO bağlantısı koptu')
      resetGameState()
    }

    const handleNicknameAssigned = (assignedNickname: string) => {
      console.log('Nickname atandı:', assignedNickname)
      setNickname(assignedNickname)
    }

    const handleRoomCreated = (newRoomId: string) => {
      console.log('Oda oluşturuldu:', newRoomId)
      if (newRoomId) {
        setGameState(prev => ({
          ...prev,
          currentRoomId: newRoomId
        }))
      } else {
        toast({
          title: 'Hata',
          description: 'Oda oluşturulamadı',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }

    const handleGameStart = ({ players }: { players: any[] }) => {
      console.log('Oyun başladı:', { players, roomId: gameState.currentRoomId })
      setGameState(prev => ({
        ...prev,
        isGameStarted: true,
        currentPlayers: players
      }))
    }

    const handlePlayerDisconnected = ({ message }: { message: string }) => {
      console.log('Oyuncu ayrıldı:', message)
      toast({
        title: 'Oyun Sona Erdi',
        description: message,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      resetGameState()
    }

    const handleRoomError = (message: string) => {
      console.log('Oda hatası:', message)
      toast({
        title: 'Hata',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('nickname_assigned', handleNicknameAssigned)
    socket.on('room_created', handleRoomCreated)
    socket.on('game_start', handleGameStart)
    socket.on('player_disconnected', handlePlayerDisconnected)
    socket.on('room_error', handleRoomError)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('nickname_assigned', handleNicknameAssigned)
      socket.off('room_created', handleRoomCreated)
      socket.off('game_start', handleGameStart)
      socket.off('player_disconnected', handlePlayerDisconnected)
      socket.off('room_error', handleRoomError)
    }
  }, [resetGameState, toast, gameState.currentRoomId])

  const handleCreateRoom = useCallback(() => {
    console.log('Oda oluşturma isteği gönderiliyor')
    socket.emit('create_room')
  }, [])

  const handleJoinRoom = useCallback((joinRoomId: string) => {
    console.log('Odaya katılma isteği gönderiliyor:', joinRoomId)
    if (joinRoomId) {
      setGameState(prev => ({
        ...prev,
        currentRoomId: joinRoomId
      }))
      socket.emit('join_room', joinRoomId)
    } else {
      toast({
        title: 'Hata',
        description: 'Geçerli bir oda ID giriniz',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [toast])

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.100" py={8}>
        <VStack spacing={8}>
          <Heading color="purple.600">Taş Kağıt Makas Online</Heading>
          {!gameState.isGameStarted ? (
            <Lobby
              socket={socket}
              nickname={nickname}
              roomId={gameState.currentRoomId}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
            />
          ) : (
            <Game
              socket={socket}
              roomId={gameState.currentRoomId}
              players={gameState.currentPlayers}
              nickname={nickname}
            />
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  )
}

export default App 