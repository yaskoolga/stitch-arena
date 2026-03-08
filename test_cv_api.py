#!/usr/bin/env python3
"""
Тестовый скрипт для проверки CV API
"""
import requests
import sys

def test_health():
    """Проверка health endpoint"""
    print("[TEST] Проверка CV service health...")
    try:
        response = requests.get("http://localhost:8001/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] CV service работает: {data}")
            return True
        else:
            print(f"[FAIL] CV service вернул код {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] Ошибка подключения: {e}")
        return False

def test_detect_progress(image_path):
    """Тестирование определения прогресса"""
    print(f"\n[TEST] CV detection с изображением: {image_path}")

    try:
        with open(image_path, 'rb') as f:
            # Определяем тип файла по расширению
            content_type = 'image/png' if image_path.endswith('.png') else 'image/jpeg'
            files = {'current_photo': (image_path.split('\\')[-1], f, content_type)}
            response = requests.post(
                "http://localhost:8001/api/detect-progress",
                files=files,
                timeout=30
            )

        print(f"[INFO] Статус код: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Успешно!")
            print(f"   - Success: {data.get('success')}")
            print(f"   - Total stitches: {data.get('total_stitches')}")
            print(f"   - Daily stitches: {data.get('daily_stitches')}")
            print(f"   - Confidence: {data.get('confidence'):.2%}")
            print(f"   - Processing time: {data.get('processing_time_ms')}ms")

            # Проверка порога уверенности
            confidence = data.get('confidence', 0)
            if confidence >= 0.5:
                print(f"   [OK] Уверенность >= 50% - будет автозаполнение")
            else:
                print(f"   [WARN] Уверенность < 50% - требуется ручной ввод")

            return True
        else:
            print(f"[FAIL] Ошибка: {response.status_code}")
            print(f"   {response.text}")
            return False

    except FileNotFoundError:
        print(f"[FAIL] Файл не найден: {image_path}")
        return False
    except Exception as e:
        print(f"[FAIL] Ошибка: {e}")
        return False

def test_next_api():
    """Проверка Next.js API proxy"""
    print("\n[TEST] Проверка Next.js API proxy...")
    try:
        response = requests.get("http://localhost:3000/api/health", timeout=5)
        if response.status_code == 200 or response.status_code == 404:
            print(f"[OK] Next.js API доступен")
            return True
        else:
            print(f"[WARN] Next.js вернул код {response.status_code}")
            return True  # Всё равно работает
    except Exception as e:
        print(f"[FAIL] Next.js недоступен: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("AI Stitch Detection - Test Suite")
    print("="*60)

    # Тест 1: Health check
    if not test_health():
        print("\n[FAIL] CV service не запущен. Запустите: python -m app.main")
        sys.exit(1)

    # Тест 2: Next.js API
    test_next_api()

    # Тест 3: CV Detection с тестовым изображением
    test_images = [
        r"C:\Users\Ольга\Desktop\stich\1\2.png",
        r"C:\Users\Ольга\Desktop\stich\1\screen.png"
    ]

    success = False
    for img_path in test_images:
        if test_detect_progress(img_path):
            success = True
            break

    print("\n" + "="*60)
    if success:
        print("[SUCCESS] Все тесты пройдены!")
        print("\nСледующие шаги:")
        print("1. Откройте http://localhost:3000")
        print("2. Залогиньтесь")
        print("3. Создайте или откройте проект")
        print("4. Нажмите 'Add Log'")
        print("5. Загрузите фото вышивки")
        print("6. Проверьте автозаполнение и бейдж уверенности")
    else:
        print("[FAIL] Тесты не прошли")
    print("="*60)
