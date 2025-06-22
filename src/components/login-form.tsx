'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M12.04 2.176c-5.49 0-9.926 4.436-9.926 9.925 0 2.21.726 4.288 2.016 5.96L2 22l4.156-2.006a9.88 9.88 0 0 0 5.882 1.832h.002c5.49 0 9.926-4.436 9.926-9.925s-4.438-9.925-9.928-9.925zm4.84 11.962c-.272.432-.92.693-1.254.738-.336.044-1.02.155-2.956-1.088-2.31-1.49-3.64-3.623-3.79-3.833-.15-.21-.864-1.165-.864-2.18s.51-.15.693-.15.377-.022.527-.022c.15 0 .336 0 .495.41.16.41.572 1.396.618 1.488.044.09.09.18.022.315-.067.134-.112.227-.227.36-.114.133-.207.155-.29.247-.083.09-.18.18-.09.36.09.18.42.75.925 1.217.66.604 1.217.814 1.396.88.18.066.27.022.36-.044.113-.089.47-.538.584-.717.114-.18.227-.15.387-.09.16.066 1.02.487 1.2.572.18.083.29.133.336.207.044.073.022.41-.25.842z"/>
    </svg>
);

export function LoginForm() {
    const [password, setPassword] = useState('');

    return (
        <div className="w-full max-w-xs mx-auto flex flex-col items-center">
            <div className="mb-8">
                <Image src="https://placehold.co/250x90.png" alt="CAMOSA Logo" width={250} height={90} data-ai-hint="company logo black" />
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Bienvenido de nuevo</h2>
                <p className="text-gray-500">Accede a tu cuenta</p>
            </div>

            <form className="space-y-6 w-full">
                <fieldset className="border border-gray-400 rounded-lg px-3">
                    <legend className="px-1 text-sm text-gray-600">Correo Electronico</legend>
                    <input
                        type="email"
                        className="w-full bg-transparent py-2 border-0 focus:outline-none focus:ring-0 text-sm"
                        autoComplete="email"
                    />
                </fieldset>

                <fieldset className="border border-gray-400 rounded-lg px-3 relative">
                    <legend className="px-1 text-sm text-gray-600">Contraseña</legend>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent py-2 border-0 focus:outline-none focus:ring-0 text-sm pr-8"
                        autoComplete="current-password"
                    />
                     {password && (
                        <button type="button" onClick={() => setPassword('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </fieldset>

                <Button type="submit" className="w-full bg-[#5d6a53] hover:bg-[#4a5542] text-white rounded-full font-semibold py-3 text-base">
                    Acceder
                </Button>
            </form>

            <div className="text-center my-6">
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                    Olvidaste la contraseña?
                </Link>
            </div>
            
            <div className="text-center my-6">
                <span className="text-sm text-gray-500">Ir hacía</span>
            </div>

            <div className="flex justify-center space-x-4">
                <Link href="#" className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"><Facebook className="w-5 h-5" /></Link>
                <Link href="#" className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"><Instagram className="w-5 h-5" /></Link>
                <Link href="#" className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"><WhatsAppIcon /></Link>
                <Link href="#" className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"><Youtube className="w-5 h-5" /></Link>
            </div>
        </div>
    );
}
