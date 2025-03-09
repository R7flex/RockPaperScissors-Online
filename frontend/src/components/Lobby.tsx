import { Box, Button, Input, Text, VStack, useToast } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'

interface LobbyProps {
  socket: Socket
  nickname: string
  roomId: string
  onCreateRoom: () => void
  onJoinRoom: (roomId: string) => void
}

const Lobby = ({ socket, nickname, roomId, onCreateRoom, onJoinRoom }: LobbyProps) => {
  const [joinRoomId, setJoinRoomId] = useState('')
  const toast = useToast()

  useEffect(() => {
    const handleRoomError = (message: string) => {
      toast({
        title: 'Hata',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    socket.on('game_error', handleRoomError)

    return () => {
      socket.off('game_error', handleRoomError)
    }
  }, [socket, toast])

  const handleJoinRoom = () => {
    const trimmedRoomId = joinRoomId.trim()
    if (!trimmedRoomId) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir oda ID girin',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    console.log('Odaya katılma isteği gönderiliyor:', trimmedRoomId)
    onJoinRoom(trimmedRoomId)
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="lg" maxW="400px" w="full">
      <VStack spacing={6}>
        <Text fontSize="xl" fontWeight="bold">
          Hoş geldin, {nickname}!
        </Text>

        {roomId ? (
          <VStack spacing={4}>
            <Text>Oda ID'niz:</Text>
            <Box
              p={4}
              bg="purple.50"
              borderRadius="md"
              fontWeight="bold"
              color="purple.600"
              wordBreak="break-all"
            >
              {roomId}
            </Box>
            <Text fontSize="sm">
              Bu ID'yi arkadaşınızla paylaşın ve oyuna başlayın!
            </Text>
          </VStack>
        ) : (
          <VStack spacing={4} w="full">
            <Button
              colorScheme="purple"
              w="full"
              onClick={() => {
                console.log('Oda oluşturma isteği gönderiliyor')
                onCreateRoom()
              }}
            >
              Yeni Oda Oluştur
            </Button>
            <Text>veya</Text>
            <Input
              placeholder="Oda ID'sini girin"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            <Button
              colorScheme="green"
              w="full"
              onClick={handleJoinRoom}
            >
              Odaya Katıl
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default Lobby 