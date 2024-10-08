import { describe, expect, test } from 'vitest';
import { Vim } from './Vim'
import { KeyEvent } from './KeyEvent';

const TEST_FILE = 
`The quick brown fox
jumps over the lazy dog
The quick brown fox
jumps over the lazy dog
The quick brown fox
jumps over the lazy dog`

describe('vim', () => {

  describe('normal mode', () => {

    describe('keyboard navigation', () => {

      test('gg', () => {
        const vim = new Vim({ file: TEST_FILE });

        vim.keyPress('2')
        vim.keyPress('g'); 
        vim.keyPress('g');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 1 });

        vim.keyPress('g');
        vim.keyPress('g');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });
      });

      test('G', () => {
        const vim = new Vim({ file: TEST_FILE });

        vim.keyPress('G');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: vim.file.lineCount() - 1 });

        vim.keyPress('2');
        vim.keyPress('G');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 1 });
      });

      test('h/l', () => {
        const vim = new Vim({ file: TEST_FILE });

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

        vim.keyPress('l');

        expect(vim.getCursorPos()).toEqual({ x: 1, y: 0 });

        vim.keyPress('2');
        vim.keyPress('l');

        expect(vim.getCursorPos()).toEqual({ x: 3, y: 0 });

        vim.keyPress('h');

        expect(vim.getCursorPos()).toEqual({ x: 2, y: 0 });

        vim.keyPress('2');
        vim.keyPress('h');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });
      });

      test('j/k', () => {
        const vim = new Vim({ file: TEST_FILE });

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

        vim.keyPress('j');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 1 });

        vim.keyPress('2');
        vim.keyPress('j');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 3 });

        vim.keyPress('k');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 2 });

        vim.keyPress('2');
        vim.keyPress('k');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });
      });

      test('0/$', () => {
        const vim = new Vim({ file: TEST_FILE });

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

        vim.keyPress('$');

        expect(vim.getCursorPos()).toEqual({ x: vim.currentLineLength() - 1, y: 0 });

        vim.keyPress('0');

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

        vim.keyPress('$');
        vim.keyPress('2');
        // Should ignore 0 if a number was pressed before it
        vim.keyPress('0')

        expect(vim.getCursorPos()).not.toEqual({ x: 0, y: 0 });

        vim.keyPress('Escape');

        vim.keyPress('2');
        vim.keyPress('$');

        expect(vim.getCursorPos()).toEqual({ x: vim.currentLineLength() - 1, y: 1 });
      });

      test("f", () => {
        const vim = new Vim({ 
          file: [
            'The quick brown fox',
            'test #'
          ].join('\n') 
        });

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

        vim.keyPress('f');
        vim.keyPress('o');

        expect(vim.getCursorPos()).toEqual({ x: 12, y: 0 });

        // You shouldn't be able to advance past the current line
        vim.keyPress('f');
        vim.keyPress('#');

        expect(vim.getCursorPos()).toEqual({ x: 12, y: 0 });
      });

      test('t', () => {
        const vim = new Vim({ 
          file: [
            'The quick brown fox',
            'test #'
          ].join('\n') 
        });

        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

        vim.keyPress('t');
        vim.keyPress('o');

        expect(vim.getCursorPos()).toEqual({ x: 11, y: 0 });

        // You shouldn't be able to advance past the current line
        vim.keyPress('t');
        vim.keyPress('#');

        expect(vim.getCursorPos()).toEqual({ x: 11, y: 0 });
      });

    });

    describe('deletion', () => {
      const vim = new Vim({ file: TEST_FILE });
      
      test('x', () => {
        expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });

        vim.keyPress('x');

        expect(vim.file.getLine(0)).toBe('he quick brown fox');

      });

      test('2x', () => {
        vim.keyPress('2');
        vim.keyPress('x');

        expect(vim.file.getLine(0)).toBe(' quick brown fox');
      });

      test('dd', () => {
        vim.keyPress('d');
        vim.keyPress('d');
        expect(vim.file.getLine(0)).toBe('jumps over the lazy dog');
        expect(vim.file.lineCount()).toBe(5);
      });

      test('2dd', () => {
        vim.keyPress('2');
        vim.keyPress('d');
        vim.keyPress('d');
        expect(vim.file.getLine(0)).toBe('jumps over the lazy dog');
        expect(vim.file.lineCount()).toBe(3);
      });

    });

    describe('history', () => {
      const vim = new Vim({ file: TEST_FILE });

      test('u', () => {
        vim.keyPress('x');
        expect(vim.file.getLine(0)).toBe('he quick brown fox');
        vim.keyPress('u');
        expect(vim.file.getLine(0)).toBe('The quick brown fox');
      });
      
      test('Ctrl-r', () => {
        expect(vim.file.getLine(0)).toBe('The quick brown fox');
        vim.keyPress(new KeyEvent({ key: 'r', ctrlKey: true }));
        expect(vim.file.getLine(0)).toBe('he quick brown fox');
      });

      test('4u', () => {
        vim.keyPress('x');
        vim.keyPress('x');
        vim.keyPress('x');
        expect(vim.file.getLine(0)).toBe('quick brown fox');
        vim.keyPress('4');
        vim.keyPress('u');
        expect(vim.file.getLine(0)).toBe('The quick brown fox');
      })

      test(`4Ctrl-r`, () => {
        vim.keyPress('4');
        vim.keyPress(new KeyEvent({ key: 'r', ctrlKey: true }));
        expect(vim.file.getLine(0)).toBe('quick brown fox');
      });

    });

  });

  describe('visual mode', () => {
    const vim = new Vim({ file: TEST_FILE });
    
    test('delete visual block', () => {
      vim.keyPress('l');
      vim.keyPress('l');
      vim.keyPress('v');
      vim.keyPress('j');
      vim.keyPress('x');
      expect(vim.file.getLine(0)).toBe('Thps over the lazy dog');

    });

  });

  describe('insert mode', () => {
    const vim = new Vim({ file: "" });
    vim.keyPress('i');

    test('typing', () => {
      vim.keyPress('t');
      vim.keyPress('e');
      vim.keyPress('s');
      vim.keyPress('t');
      expect(vim.file.getLine(0)).toBe('test');
    });

    test('Backspace', () => {
      vim.keyPress('Backspace');
      expect(vim.file.getLine(0)).toBe('tes');
      vim.keyPress('Backspace');
      expect(vim.file.getLine(0)).toBe('te');
    });

    test('arrow left', () => {
      vim.keyPress('ArrowLeft');
      vim.keyPress('ArrowLeft');
      vim.keyPress('ArrowLeft');
      expect(vim.getCursorPos()).toEqual({ x: 0, y: 0 });
    })

    test('arrow left', () => {
      vim.keyPress('ArrowRight');
      vim.keyPress('ArrowRight');
      expect(vim.getCursorPos()).toEqual({ x: 2, y: 0 });
    })


  });


});
