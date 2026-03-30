import type { CycleContext, ChatMessage } from '@/types';
import { PHASE_CONFIG } from '@/types';
import { generateId } from '@/lib/utils';

export function createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return { id: generateId(), role, content, timestamp: new Date().toISOString() };
}

export function getChatbotResponse(input: string, ctx: CycleContext): string {
  const lower = input.toLowerCase();
  const phase = ctx.currentPhase;
  const config = PHASE_CONFIG[phase];

  if (lower.match(/tired|fatigue|exhausted|sleepy|low energy|drained/)) {
    if (phase === 'menstrual') {
      return `Fatigue during menstruation is completely normal! Your body is working hard. 💕\n\n**What helps:**\n- Stay hydrated — 8+ glasses of water\n- Iron-rich foods (spinach, lentils)\n- Rest when you can\n- Light stretching or gentle yoga\n- Warm bath or heating pad\n\nYour energy should improve in ${Math.max(1, 6 - ctx.dayInCycle)} days. 💚\n\n⚠️ *General wellness info, not medical advice.*`;
    }
    if (phase === 'luteal') {
      return `Late luteal fatigue is very common — progesterone naturally makes you sleepy.\n\n**Tips:**\n- Magnesium-rich foods (nuts, dark chocolate)\n- Regular sleep schedule\n- Gentle exercise\n- Reduce caffeine after 2pm\n- Complex carbs for steady energy\n\n${ctx.daysUntilPeriod > 0 ? `Should improve once your period starts (~${ctx.daysUntilPeriod} days). ` : ''}🌸\n\n⚠️ *General wellness info, not medical advice.*`;
    }
    return `Here are some energy-boosting tips:\n\n- Check sleep quality (7-9 hours)\n- Stay hydrated and eat balanced meals\n- Get sunlight early in the day\n- Light exercise can boost energy\n- Consider stress levels\n\nIf fatigue persists, check iron/thyroid with your doctor. 🌿\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/cramp|pain|hurt|ache|painful|sore/)) {
    return `**Relief strategies:**\n\n✓ Heat pad on lower abdomen (15-20 min)\n✓ Gentle stretching — child's pose, cat-cow\n✓ Warm bath with Epsom salts\n✓ Anti-inflammatory foods (ginger tea, turmeric)\n✓ Omega-3 fatty acids\n\n⚠️ **Severe pain that disrupts daily life deserves medical attention.** 💗\n\n*General wellness info, not medical advice.*`;
  }

  if (lower.match(/sad|down|depressed|cry|crying|emotional|mood/)) {
    return `Feeling emotional is so normal — hormone changes affect neurotransmitters. 💕\n\n**Be gentle with yourself:**\n- Comfort activities: warm drinks, favorite shows\n- Reach out to someone you trust\n- Journaling helps process feelings\n- B vitamins and omega-3s support mood\n\n**Affirmation:** *"My emotions are valid. This will pass."*\n\nIf sadness is overwhelming, please reach out to a mental health professional. 🤗\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/anxious|anxiety|worried|panic|nervous/)) {
    return `Anxiety can be intensified by hormonal changes during the ${phase} phase. 💕\n\n**In-the-moment relief:**\n- 4-7-8 Breathing: Inhale 4s, hold 7s, exhale 8s\n- Grounding: Feel your feet on the floor\n- Cold water on wrists\n- Progressive muscle relaxation\n\n**Ongoing:**\n- Limit caffeine\n- Regular exercise\n- Journaling\n- Magnesium supplementation (consult doctor)\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/eat|food|diet|nutrition|hungry|crav/)) {
    const foods: Record<string, string> = {
      menstrual: '🍫 **Menstrual phase foods:**\n- Iron-rich: spinach, lentils, red meat\n- Anti-inflammatory: salmon, turmeric, ginger\n- Dark chocolate (magnesium!)\n- Warm soups and comfort foods',
      follicular: '🥗 **Follicular phase foods:**\n- Light, fresh foods\n- Fermented foods (kimchi, yogurt)\n- Lean proteins\n- Fresh fruits and veggies',
      ovulation: '🥑 **Ovulation phase foods:**\n- Anti-inflammatory foods\n- Fiber-rich vegetables\n- Light grains (quinoa)\n- Plenty of water',
      luteal: '🍠 **Luteal phase foods:**\n- Complex carbs (sweet potato, brown rice)\n- Magnesium-rich (nuts, seeds, dark chocolate)\n- B-vitamin foods (whole grains)\n- Calcium-rich foods',
    };
    return `${foods[phase]}\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/exercise|workout|gym|run|yoga|fitness/)) {
    const exercises: Record<string, string> = {
      menstrual: '🧘 Gentle yoga, light walking, stretching\nListen to your body and rest when needed.',
      follicular: '🏃 High-intensity workouts, try new activities!\nYour body can handle more now.',
      ovulation: '💪 Peak performance time! HIIT, strength training, social sports.',
      luteal: '🚶 Moderate exercise: swimming, pilates, walking\nGentle movement helps PMS symptoms.',
    };
    return `**Exercise tips for ${config.name} phase:**\n\n${exercises[phase]}\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/period|when|next|predict/)) {
    return `📅 **Your cycle info:**\n\n- Current phase: ${config.emoji} ${config.name}\n- Day in cycle: ${ctx.dayInCycle}\n- Cycle length: ~${ctx.cycleLength} days\n- Next period: ~${ctx.daysUntilPeriod} days away\n- Prediction confidence: ${ctx.confidence}%\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/why.*feel|what.*happening|explain/)) {
    const explanations: Record<string, string> = {
      menstrual: 'During menstruation, estrogen and progesterone are at their lowest. This can cause fatigue, cramps, and mood changes. It\'s your body\'s natural reset. 💜',
      follicular: 'Estrogen is rising now, boosting your mood and energy. You may feel more creative and social. Embrace this upward energy! ✨',
      ovulation: 'Estrogen peaks and a surge of LH triggers ovulation. You\'re likely feeling confident and energetic. Communication skills are enhanced! ☀️',
      luteal: 'Progesterone rises after ovulation, which can cause PMS symptoms like bloating, mood shifts, and fatigue. This is completely normal and temporary. 🌸',
    };
    return `${explanations[phase]}\n\n**Hormonal changes may cause what you\'re feeling. It\'s completely normal.** 💜\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/self.?care|relax|calm|sooth/)) {
    return `**Self-care ideas for ${config.name} phase:**\n\n${config.tips.map(t => `• ${t}`).join('\n')}\n\n**Affirmation:** *"${config.affirmations[Math.floor(Math.random() * config.affirmations.length)]}"*\n\n⚠️ *General wellness info, not medical advice.*`;
  }

  if (lower.match(/hello|hi|hey|help/)) {
    return `Hi there! 👋 I'm your FemNexa companion. I can help with:\n\n🌸 **Cycle info** — "When is my next period?"\n💊 **Symptom relief** — "Help me with cramps"\n🍎 **Nutrition** — "What should I eat?"\n🧘 **Wellness** — "Self-care ideas"\n🧠 **Understanding** — "Why am I feeling this way?"\n\nJust ask me anything! 💜`;
  }

  // Default empathetic response
  return `Thank you for sharing that with me. 💜\n\nYou're currently in the **${config.emoji} ${config.name} phase** (Day ${ctx.dayInCycle}). ${config.tips[Math.floor(Math.random() * config.tips.length)]}\n\n**Remember:** ${config.affirmations[Math.floor(Math.random() * config.affirmations.length)]}\n\nFeel free to ask me about nutrition, exercise, symptoms, or anything else! 🌸\n\n⚠️ *General wellness info, not medical advice.*`;
}
