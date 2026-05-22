import "reflect-metadata";
import { Bebas_Neue, Nunito } from 'next/font/google';
import './globals.css';


import 'bootstrap-icons/font/bootstrap-icons.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata = {
  title: 'FastDrive',
  description: 'Transporte estudiantil universitario en Medellín',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Aquí se aplican las variables de las fuentes a todo el cuerpo de la web */}
      <body className={`${bebasNeue.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}