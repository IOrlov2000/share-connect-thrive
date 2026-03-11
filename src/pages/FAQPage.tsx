import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqSections = [
  {
    title: "Начало работы",
    items: [
      { q: "Как зарегистрироваться?", a: "Нажмите «Войти» и введите номер телефона. Вам придёт SMS с кодом подтверждения. После ввода кода ваш аккаунт будет создан автоматически." },
      { q: "Как создать объявление?", a: "Нажмите кнопку «Создать» в нижнем меню. Добавьте до 5 фото, название, описание, категорию, цену и адрес. Нажмите «Опубликовать»." },
      { q: "Сколько объявлений можно создать?", a: "Количество объявлений не ограничено. Создавайте столько, сколько нужно." },
    ],
  },
  {
    title: "Обмен",
    items: [
      { q: "Как предложить обмен?", a: "Откройте интересующее объявление и нажмите «Предложить обмен». Выберите своё объявление из списка и отправьте предложение. Владелец получит уведомление в чате." },
      { q: "Как принять или отклонить обмен?", a: "Предложения обмена приходят в чат. Вы можете принять, отклонить или обсудить условия с собеседником." },
      { q: "Можно ли обменять на деньги?", a: "Да, вы можете указать цену за вещь. Обмен и продажа — на ваше усмотрение." },
    ],
  },
  {
    title: "Благотворительность",
    items: [
      { q: "Как работает благотворительность?", a: "При создании объявления включите «Пожертвовать». Вещь станет доступна бесплатно для фондов и нуждающихся." },
      { q: "Кто может получить благотворительные вещи?", a: "Любой зарегистрированный пользователь может связаться с дарителем. Фонды-партнёры имеют приоритет." },
    ],
  },
  {
    title: "Безопасность",
    items: [
      { q: "Безопасно ли обмениваться?", a: "Мы рекомендуем встречаться в общественных местах, проверять вещи перед обменом и общаться через внутренний чат." },
      { q: "Как пожаловаться на объявление?", a: "Напишите нам в службу поддержки с описанием проблемы. Мы рассмотрим жалобу в течение 24 часов." },
      { q: "Как удалить аккаунт?", a: "Перейдите в Профиль → Настройки → «Удалить аккаунт». Все ваши данные будут удалены безвозвратно." },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Вопрос — Ответ</h1>
      </div>

      <div className="flex items-center gap-2 rounded-xl border bg-accent/50 p-4">
        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Не нашли ответ? <Link to="/support" className="text-primary hover:underline font-medium">Напишите в поддержку</Link>
        </p>
      </div>

      {faqSections.map((section, si) => (
        <section key={si} className="space-y-3">
          <h2 className="font-display text-lg font-semibold">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item, ii) => {
              const key = `${si}-${ii}`;
              return (
                <div key={key} className="rounded-xl border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleItem(key)}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    {item.q}
                    {openItems[key] ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                    )}
                  </button>
                  {openItems[key] && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
