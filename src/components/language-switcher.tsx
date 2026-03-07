"use client";

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

const languages = [
  { code: 'en', name: 'English', flag: 'gb', emoji: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: 'ru', emoji: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: 'de', emoji: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: 'fr', emoji: '🇫🇷' },
  { code: 'es', name: 'Español', flag: 'es', emoji: '🇪🇸' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    // Set cookie and refresh
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Image
            src={`https://flagcdn.com/w20/${currentLanguage.flag}.png`}
            alt={currentLanguage.name}
            width={20}
            height={15}
            className="rounded-sm"
          />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={locale === lang.code ? 'bg-accent' : ''}
          >
            <Image
              src={`https://flagcdn.com/w20/${lang.flag}.png`}
              alt={lang.name}
              width={16}
              height={12}
              className="mr-2 rounded-sm"
            />
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
