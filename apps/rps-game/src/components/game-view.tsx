import { useState, useEffect, useCallback } from 'react'
import { FlashButton, Row } from 'ui'
import { useRpsGameContext, GameStatus, useTicketContext } from '../contexts'
import useUtils from '../utils'

type PlayerMove = 'rock' | 'paper' | 'scissors' | undefined

const GameView = () => {
  const [locked, setLocked] = useState(false)
  const [playerMove, setPlayerMove] = useState<PlayerMove>(undefined)
  const [opponentMove, setOpponentMove] = useState<PlayerMove>(undefined)
  const [message, setMessage] = useState<string>('')

  const {
    state: {
      gameStatus,
      gameMatchID,
      gamePieceNFTID,
      gameResult,
      isGameInitialized,
      isGameInitializedStateLoading,
      setupNewSinglePlayerMatch,
      submitBothSinglePlayerMoves,
      resolveMatchAndReturnNFTS,
      resetGame,
      gamePlayerID,
      winLossRecord,
    },
  } = useRpsGameContext()

  const { ticketAmount } = useTicketContext()

  console.log('RPS GAME STATE', {
    gameStatus,
    gameMatchID,
    gamePieceNFTID,
    gameResult,
    isGameInitialized,
    isGameInitializedStateLoading,
    setupNewSinglePlayerMatch,
    submitBothSinglePlayerMoves,
    resolveMatchAndReturnNFTS,
    resetGame,
    gamePlayerID,
    winLossRecord,
  })

  const handleEndgame = useCallback(
    async function (gameResult: any) {
      const playerNFTID = gamePieceNFTID
      const playerID = gamePlayerID
      const {
        matchID,
        player1ID,
        player1MoveRawValue,
        player2ID,
        player2MoveRawValue,
        returnedNFTIDs,
        winningGamePlayer,
        winningNFTID,
      } = gameResult

      const playerMove =
        playerID === player1ID ? player1MoveRawValue : player2MoveRawValue
      const opponentMove =
        playerID === player1ID ? player2MoveRawValue : player1MoveRawValue

      let playerMoveString: PlayerMove
      if (playerMove === '0') {
        playerMoveString = 'rock'
      } else if (playerMove === '1') {
        playerMoveString = 'paper'
      } else if (playerMove === '2') {
        playerMoveString = 'scissors'
      }

      let opponentMoveString: PlayerMove
      if (opponentMove === '0') {
        opponentMoveString = 'rock'
        setOpponentMove('rock')
      } else if (opponentMove === '1') {
        opponentMoveString = 'paper'
        setOpponentMove('paper')
      } else if (opponentMove === '2') {
        opponentMoveString = 'scissors'
        setOpponentMove('scissors')
      }

      if (winningNFTID === null) {
        setMessage(
          `You played ${playerMoveString} and tied ${opponentMoveString}!`
        )
      }

      const isPlayerWinner = playerID === winningGamePlayer

      if (isPlayerWinner) {
        setMessage('You won! You get 10 tickets! 🎟')
      } else if (winningNFTID && !isPlayerWinner) {
        setMessage(
          `You played ${playerMoveString} and lost against ${opponentMoveString}!`
        )
      }
    },
    [gamePieceNFTID, gamePlayerID]
  )

  useEffect(() => {
    if (gameStatus === GameStatus.READY) {
      console.log('gameStatus READY', gameStatus)
    }
    if (gameStatus === GameStatus.PLAYING) {
      console.log('gameStatus PLAYING', gameStatus)
    }
    if (gameStatus === GameStatus.ENDED) {
      handleEndgame(gameResult)
    }
  }, [
    gameResult,
    gameStatus,
    handleEndgame,
    setupNewSinglePlayerMatch,
    resetGame,
  ])

  const toggleDisableButtons = () => {
    setLocked(locked => !locked)
  }

  const handlePlayAgain = async (command: string) => {
    if (gameStatus !== GameStatus.ENDED) return

    if (command === 'y') {
      await resetGame()
      await setupNewSinglePlayerMatch()
    }
  }

  const handlePlay = async () => {
    if (gameStatus !== GameStatus.READY) return

    await setupNewSinglePlayerMatch()
  }

  const handleMove = async (command: string) => {
    if (gameStatus !== GameStatus.PLAYING) return

    if (command === 'r') {
      setPlayerMove('rock')
      await submitBothSinglePlayerMoves(0)
    } else if (command === 'p') {
      setPlayerMove('paper')
      await submitBothSinglePlayerMoves(1)
    } else if (command === 's') {
      setPlayerMove('scissors')
      await submitBothSinglePlayerMoves(2)
    }

    await resolveMatchAndReturnNFTS()
  }

  return (
    <>
      {message && (
        <section className="flex w-full items-center justify-center space-x-4 pt-6 text-2xl text-blue-500">
          <span className="text-xl font-extrabold">{message}</span>
        </section>
      )}
      <div className="grid gap-3 pt-3 md:grid-cols-3 lg:w-2/3">
        <section>
          <div className="text-2xl text-gray-700">PLAYER</div>
          <div className="text-3xl font-extrabold leading-normal text-gray-700 md:text-[3rem]">
            {winLossRecord?.wins ?? 0}
          </div>
          <div>
            {playerMove === 'rock' && (
              <span className="text-9xl font-extrabold">🪨</span>
            )}
            {playerMove === 'paper' && (
              <span className="text-9xl font-extrabold">📄</span>
            )}
            {playerMove === 'scissors' && (
              <span className="text-9xl font-extrabold">✂️</span>
            )}
          </div>
        </section>
        <section>
          <div className="text-2xl text-gray-700">TIES</div>
          <div className="text-3xl font-extrabold leading-normal text-gray-700 md:text-[3rem]">
            {winLossRecord?.ties ?? 0}
          </div>
        </section>
        <section>
          <div className="text-2xl text-gray-700">OPPONENT</div>
          <div className="text-3xl font-extrabold leading-normal text-gray-700 md:text-[3rem]">
            {winLossRecord?.losses ?? 0}
          </div>
          <div>
            {opponentMove === 'rock' && (
              <span className="text-9xl font-extrabold">🪨</span>
            )}
            {opponentMove === 'paper' && (
              <span className="text-9xl font-extrabold">📄</span>
            )}
            {opponentMove === 'scissors' && (
              <span className="text-9xl font-extrabold">✂️</span>
            )}
          </div>
        </section>
      </div>
      {gameStatus === GameStatus.PLAYING && (
        <Row>
          <FlashButton onClick={() => handleMove('r')} disabled={locked}>
            Rock
          </FlashButton>
          <FlashButton onClick={() => handleMove('p')} disabled={locked}>
            Paper
          </FlashButton>
          <FlashButton onClick={() => handleMove('s')} disabled={locked}>
            Scissors
          </FlashButton>
        </Row>
      )}
      {gameStatus === GameStatus.ENDED && (
        <Row>
          <FlashButton onClick={() => handlePlayAgain('y')} disabled={locked}>
            Play Again!
          </FlashButton>
        </Row>
      )}
      {gameStatus === GameStatus.READY && (
        <Row>
          <FlashButton onClick={() => handlePlay()} disabled={locked}>
            Play!
          </FlashButton>
        </Row>
      )}

      {ticketAmount && (
        <div className="flex w-full items-center justify-center space-x-4 pt-6 text-2xl text-blue-500">
          <span className="text-xl font-extrabold">
            🎟 Tickets: {ticketAmount}
          </span>
        </div>
      )}
    </>
  )
}

export default GameView
