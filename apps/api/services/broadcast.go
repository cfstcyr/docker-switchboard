package services

import (
	"log"
	"time"

	"github.com/cfstcyr/docker-switchboard/models"
)

type BroadcastOptions[T any] struct {
	WsService *WsService
	Interval  time.Duration
	EventName string
	GetData   func() (T, error)
}

type BroadcastService[T any] struct {
	opts      BroadcastOptions[T]
	isRunning bool
	stopChan  chan struct{}
	ticker    *time.Ticker
}

func NewBroadcastService[T any](opts BroadcastOptions[T]) *BroadcastService[T] {
	return &BroadcastService[T]{
		opts:      opts,
		isRunning: false,
		stopChan:  make(chan struct{}),
	}
}

func (b *BroadcastService[T]) Init() {
	connected := b.opts.WsService.ConnectClient.Subscribe()
	go func() {
		for conn := range connected {
			b.start()
			data, err := b.opts.GetData()

			if err != nil {
				log.Println("Error fetching data:", err)
				continue
			}

			err = Send(conn, models.Event{
				Event: b.opts.EventName,
				Data:  data,
			})

			if err != nil {
				log.Println("Error sending WebSocket message:", err)
			}
		}
	}()

	disconnected := b.opts.WsService.DisconnectClient.Subscribe()
	go func() {
		for range disconnected {
			if b.opts.WsService.GetClientCount() == 0 {
				b.stop()
			}
		}
	}()
}

func (b *BroadcastService[T]) start() {
	if !b.isRunning {
		b.isRunning = true
		b.stopChan = make(chan struct{})
		go b.startBroadcast()
	}
}

func (b *BroadcastService[T]) stop() {
	if b.isRunning {
		close(b.stopChan)
		b.isRunning = false
	}
}

func (b *BroadcastService[T]) executeNow() (T, error) {
	clientCount := b.opts.WsService.GetClientCount()

	if clientCount == 0 {
		var zero T
		return zero, nil
	}

	data, err := b.opts.GetData()

	if err != nil {
		log.Println("Error fetching data:", err)
		var zero T
		return zero, err
	}

	errs := b.opts.WsService.SendAll(models.Event{
		Event: b.opts.EventName,
		Data:  data,
	})

	if len(errs) > 0 {
		for _, err := range errs {
			log.Println("Error sending WebSocket message:", err)
		}

		var zero T
		return zero, errs[0]
	}

	return data, nil
}

func (b *BroadcastService[T]) ExecuteNow() (T, error) {
	b.ticker.Reset(time.Duration(b.opts.Interval) * time.Second)
	return b.executeNow()
}

func (b *BroadcastService[T]) startBroadcast() {
	b.ticker = time.NewTicker(time.Duration(b.opts.Interval) * time.Second)
	defer b.ticker.Stop()

	log.Println("Starting broadcast with interval:", b.opts.Interval)
	b.executeNow()
	for {
		select {
		case <-b.stopChan:
			log.Println("Stopping broadcast (no clients)")
			return
		case <-b.ticker.C:
			b.executeNow()
		}
	}
}
