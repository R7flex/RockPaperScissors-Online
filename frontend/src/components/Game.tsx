import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Button,
  Grid,
  Text,
  VStack,
  HStack,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { Socket } from 'socket.io-client'
import { GiRock, GiPaper, GiScissors } from 'react-icons/gi'
import { IconType } from 'react-icons'

interface GameProps {
  socket: Socket
  roomId: string
  players: any[]
  nickname: string
}

interface Move {
  id: string
  icon: IconType
  label: string
  color: string
}

const moves: Move[] = [
  { id: 'taş', icon: GiRock, label: 'Taş', color: 'gray.700' },
  { id: 'kağıt', icon: GiPaper, label: 'Kağıt', color: 'blue.500' },
  { id: 'makas', icon: GiScissors, label: 'Makas', color: 'red.500' },
]

const Game = ({ socket, roomId, players, nickname }: GameProps) => {
  const [selectedMove, setSelectedMove] = useState('')
  const [gameResult, setGameResult] = useState<Record<string, string> | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [opponentMoved, setOpponentMoved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const currentRoomId = useRef(roomId)
  const toast = useToast()

  useEffect(() => {
    currentRoomId.current = roomId
    console.log('RoomId güncellendi:', roomId)
  }, [roomId])

  const resetGameState = useCallback(() => {
    if (!currentRoomId.current) return
    setGameResult(null)
    setSelectedMove('')
    setOpponentMoved(false)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!currentRoomId.current) {
      console.error('RoomId bulunamadı!')
      return
    }

    console.log('Game bileşeni başlatıldı - Oda:', currentRoomId.current)

    const handleGameResult = ({ moves: gameMoves, scores: gameScores, winner }) => {
      console.log('Oyun sonucu alındı:', { moves: gameMoves, scores: gameScores, winner, roomId: currentRoomId.current });
      setGameResult(gameMoves)
      setScores(gameScores)
      setIsLoading(false)

      setTimeout(() => {
        resetGameState()
      }, 2000)

      toast({
        title: winner === 'berabere' ? 'Berabere!' : `${winner === nickname ? 'Kazandınız!' : 'Kaybettiniz!'}`,
        status: winner === 'berabere' ? 'info' : winner === nickname ? 'success' : 'error',
        duration: 2000,
        isClosable: true,
      })
    }

    const handleOpponentMoved = () => {
      console.log('Rakip hamle yaptı - Oda:', currentRoomId.current);
      setOpponentMoved(true)
    }

    const handleGameError = (message: string) => {
      console.log('Oyun hatası:', message, '- Oda:', currentRoomId.current);
      toast({
        title: 'Hata',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setIsLoading(false)
      setSelectedMove('')
    }

    socket.on('game_result', handleGameResult)
    socket.on('opponent_moved', handleOpponentMoved)
    socket.on('game_error', handleGameError)

    return () => {
      socket.off('game_result', handleGameResult)
      socket.off('opponent_moved', handleOpponentMoved)
      socket.off('game_error', handleGameError)
    }
  }, [socket, nickname, toast, resetGameState])

  const handleMove = useCallback((move: string) => {
    if (!currentRoomId.current) {
      console.error('Hamle yapılamıyor - RoomId bulunamadı!')
      toast({
        title: 'Hata',
        description: 'Oyun odası bulunamadı',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (selectedMove) {
      toast({
        title: 'Uyarı',
        description: 'Zaten bir hamle yaptınız',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    console.log('Hamle yapılıyor:', move, '- Oda:', currentRoomId.current);
    setSelectedMove(move)
    setIsLoading(true)
    socket.emit('make_move', { roomId: currentRoomId.current, move })
  }, [selectedMove, socket, toast])

  const opponent = players.find((p) => p.nickname !== nickname)

  const renderMoveIcon = (moveId: string, size: number = 8) => {
    const move = moves.find(m => m.id === moveId)
    if (!move) return null
    const Icon = move.icon
    return <Icon size={`${size}rem`} color={move.color} />
  }

  if (!currentRoomId.current) {
    return (
      <Box bg="white" p={8} borderRadius="xl" shadow="lg" maxW="600px" w="full">
        <VStack spacing={4}>
          <Text>Oyun odası bulunamadı</Text>
          <Spinner color="purple.500" />
        </VStack>
      </Box>
    )
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="lg" maxW="600px" w="full">
      <VStack spacing={8}>
        <HStack justify="space-between" w="full">
          <VStack>
            <Text fontWeight="bold">{nickname}</Text>
            <Text>Skor: {scores[socket.id] || 0}</Text>
          </VStack>
          <Text fontSize="xl">VS</Text>
          <VStack>
            <Text fontWeight="bold">{opponent?.nickname || 'Rakip'}</Text>
            <Text>Skor: {scores[opponent?.id] || 0}</Text>
          </VStack>
        </HStack>

        {gameResult ? (
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">
              Sonuç
            </Text>
            <HStack spacing={8}>
              <VStack>
                <Text>Senin Hamlen</Text>
                {gameResult && socket.id && renderMoveIcon(gameResult[socket.id], 6)}
              </VStack>
              <VStack>
                <Text>Rakibin Hamlesi</Text>
                {gameResult && opponent?.id && renderMoveIcon(gameResult[opponent.id], 6)}
              </VStack>
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={4}>
            <Text>Hamlenizi Seçin</Text>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              {moves.map((move) => (
                <Button
                  key={move.id}
                  onClick={() => handleMove(move.id)}
                  h="120px"
                  isDisabled={!!selectedMove || isLoading}
                  _hover={{ transform: 'scale(1.05)', bg: 'gray.50' }}
                  transition="all 0.2s"
                  bg={selectedMove === move.id ? 'purple.100' : 'white'}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  {renderMoveIcon(move.id, 4)}
                  <Text>{move.label}</Text>
                </Button>
              ))}
            </Grid>
            {(isLoading || selectedMove) && (
              <VStack>
                <Text color="gray.500">
                  {selectedMove
                    ? opponentMoved
                      ? "Sonuç hesaplanıyor..."
                      : "Rakibin hamlesini bekliyoruz..."
                    : "Yükleniyor..."}
                </Text>
                <Spinner color="purple.500" />
              </VStack>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default Game 