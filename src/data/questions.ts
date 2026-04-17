import { Question } from '../types';

export const QUESTIONS: Question[] = [
  // LEVEL 1 - EASY (10 pts)
  { id: 1, level: 1, type: 'mcq', image: '🍎', text: 'What is this?', options: ['Banana', 'Apple', 'Dog', 'Cat'], answer: 1, points: 10 },
  { id: 2, level: 1, type: 'mcq', image: '🐶', text: 'What is this?', options: ['Cat', 'Dog', 'Fish', 'Bird'], answer: 1, points: 10 },
  { id: 3, level: 1, type: 'mcq', image: '🐱', text: 'What is this?', options: ['Dog', 'Cat', 'Duck', 'Cow'], answer: 1, points: 10 },
  { id: 4, level: 1, type: 'mcq', image: '🍌', text: 'What is this?', options: ['Apple', 'Banana', 'Orange', 'Mango'], answer: 1, points: 10 },
  { id: 5, level: 1, type: 'mcq', image: '🔴', text: 'What color is it?', options: ['Blue', 'Yellow', 'Red', 'Green'], answer: 2, points: 10 },
  { id: 6, level: 1, type: 'mcq', image: '🔵', text: 'What color is it?', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 1, points: 10 },
  { id: 7, level: 1, type: 'mcq', image: '2️⃣', text: 'What number is this?', options: ['One', 'Two', 'Three', 'Four'], answer: 1, points: 10 },
  { id: 8, level: 1, type: 'mcq', image: '⭕', text: 'What shape is it?', options: ['Square', 'Triangle', 'Circle', 'Star'], answer: 2, points: 10 },
  
  // LEVEL 2 - MEDIUM (20 pts)
  { id: 9, level: 2, type: 'tf', image: '🐶', text: 'This is a dog.', options: ['True', 'False'], answer: 0, points: 20 },
  { id: 10, level: 2, type: 'tf', image: '🍌', text: 'The banana is red.', options: ['True', 'False'], answer: 1, points: 20 },
  { id: 11, level: 2, type: 'tf', image: '🦅', text: 'A bird can fly.', options: ['True', 'False'], answer: 0, points: 20 },
  { id: 12, level: 2, type: 'tf', image: '💧', text: 'This is water.', options: ['True', 'False'], answer: 0, points: 20 },
  { id: 13, level: 2, type: 'tf', image: '🪑', text: 'This is a table.', options: ['True', 'False'], answer: 1, points: 20 },
  { id: 14, level: 2, type: 'tf', image: '🐘', text: 'An elephant is big.', options: ['True', 'False'], answer: 0, points: 20 },
  { id: 15, level: 2, type: 'tf', image: '🧢', text: 'This is a hat.', options: ['True', 'False'], answer: 0, points: 20 },
  { id: 16, level: 2, type: 'tf', image: '🎁', text: "We say 'Thank you' when we get a gift.", options: ['True', 'False'], answer: 0, points: 20 },
  
  // LEVEL 3 - HARD (30 pts)
  { id: 17, level: 3, type: 'tf', image: '🐱', text: 'I have a cat.', options: ['True', 'False'], answer: 0, points: 30 },
  { id: 18, level: 3, type: 'tf', image: '🍎', text: 'This is a apple.', options: ['True', 'False'], answer: 1, points: 30 }, // False because 'an apple'
  { id: 19, level: 3, type: 'tf', image: '😁', text: 'I am happy.', options: ['True', 'False'], answer: 0, points: 30 },
  { id: 20, level: 3, type: 'tf', image: '🐭', text: 'The mouse is big.', options: ['True', 'False'], answer: 1, points: 30 },
];
