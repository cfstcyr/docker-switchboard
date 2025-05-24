package models

import (
	"sync"
)

type Subject[T any] struct {
	listeners []chan T
	lock      sync.Mutex
}

func NewSubject[T any]() *Subject[T] {
	return &Subject[T]{
		listeners: make([]chan T, 0),
	}
}

func (s *Subject[T]) Subscribe() <-chan T {
	s.lock.Lock()
	defer s.lock.Unlock()

	ch := make(chan T)
	s.listeners = append(s.listeners, ch)
	return ch
}

func (s *Subject[T]) Unsubscribe(ch <-chan T) {
	s.lock.Lock()
	defer s.lock.Unlock()

	for i, listener := range s.listeners {
		if listener == ch {
			close(listener)
			s.listeners = append(s.listeners[:i], s.listeners[i+1:]...)
			break
		}
	}
}

func (s *Subject[T]) Next(data T) {
	s.lock.Lock()
	defer s.lock.Unlock()

	for _, listener := range s.listeners {
		listener <- data
	}
}