import { Component, ViewChild, ElementRef } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

interface Message {
  text: string;
  from: string;
  timestamp: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('messagesComponent') messagesComponent!: ElementRef<HTMLDivElement>;
  name = 'test';
  text = '';
  messages: Message[] = [];
  socket?: WebSocketSubject<any>;

  join() {
    this.socket = webSocket({
      url: 'ws://localhost:8000',
      openObserver: {
        next: () => {
          console.log('connected');
          this.socket?.next({ name: this.name });
        }
      },
      closeObserver: {
        next: () => {
          console.log('disconnected')
        }
      }
    });

    this.socket.subscribe({
      next: value => {
        this.messages.push(value);
        setTimeout(() => {
          this.messagesComponent.nativeElement.scrollTo({
            top: this.messagesComponent.nativeElement.scrollHeight
          });
        });
      }
    });
  }

  sendMessage() {
    this.messages.push({
      from: this.name,
      text: this.text,
      timestamp: Date.now()
    });
    this.socket?.next({
      text: this.text
    });
    this.text = '';
  }

  scroll() {
    this.messagesComponent.nativeElement.scrollTo({
      top: this.messagesComponent.nativeElement.scrollHeight,
      behavior: 'smooth'
    });
  }

  getRandomColor(string: string): string {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();

    const colorHex = '#' + '00000'.substring(0, 6 - color.length) + color;

    const rgb = parseInt(colorHex.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const hsl = this.rgbToHsl(r, g, b);

    const tonoPastel = this.hslToRgb(hsl.h, Math.min(hsl.s * 1.5, 1), Math.min(hsl.l * 1.2, 1));

    const colorPastelHex = this.rgbToHex(tonoPastel.r, tonoPastel.g, tonoPastel.b);

    return colorPastelHex;
  }

  rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    r /= 255, g /= 255, b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h, s, l };
  }

  hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  rgbToHex(r: number, g: number, b: number): string {
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
  }
}
