export function generateSEOContent(exerciseName: string) {
  // Capitalize words
  const name = exerciseName
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const variations = [
    `The ${name} is a highly effective stretching exercise designed to improve flexibility, relieve built-up muscle tension, and increase overall mobility. Whether you are an athlete looking to enhance your performance, a desk worker trying to alleviate chronic stiffness, or simply someone aiming to maintain a healthy and active lifestyle, integrating the ${name} into your regular routine can be transformative. Our muscles often become tight and restricted due to prolonged sitting, intense physical activity, or everyday stress. The ${name} specifically targets these areas of tension, helping to restore your natural range of motion and promoting a deep sense of physical relaxation. By taking the time to perform this stretch correctly, you are actively investing in your long-term joint health and muscular resilience. Read on to discover the specific benefits, step-by-step instructions, and safety tips to ensure you are getting the most out of the ${name}.`,
    `The ${name} is one of the most effective stretches for improving flexibility. If you’re dealing with tight muscles, the ${name} can help relieve tension. ${name} is commonly used to improve mobility and reduce stiffness.`,
    `Discover the profound benefits of the ${name}, a stretch that goes beyond simple flexibility. It helps relieve muscle tightness resulting from prolonged sitting or intense workouts. Adding the ${name} to your fitness regimen can restore natural range of motion, boost circulation, and offer deep physical relaxation. Ensure you do it right to invest in your joint health and prevent injuries. Here are the step-by-step instructions and safety guidelines.`
  ];

  const intro = variations[Math.floor(Math.random() * variations.length)];

  return {
    title: `${name} Stretch: Benefits, How To Do It, and Routine`,
    description: `Learn how to perform the ${name} correctly. Discover the incredible benefits, expert tips, common mistakes to avoid, and how to add it to your daily routine.`,
    h1: `${name} Stretch Guide`,
    content: {
      intro,
      benefits: [
        `Increased Flexibility and Range of Motion: Regularly performing the ${name} helps to lengthen the targeted muscle fibers. This increased elasticity allows your joints to move more freely, which makes everyday activities and athletic movements significantly easier and more fluid.`,
        `Enhanced Blood Circulation: Stretching stimulates blood flow to your muscles. This surge of circulation delivers vital nutrients and oxygen to the tissues, which accelerates recovery after a workout and helps flush out metabolic waste products that can cause soreness.`,
        `Improved Posture and Alignment: Tight muscles often pull our skeletal structure out of alignment, leading to poor posture. By releasing tension through the ${name}, you can help bring your body back into balance, reducing the strain on your spine and supporting a taller, more upright posture.`,
        `Stress Relief and Mental Clarity: Physical tension is closely linked to psychological stress. Taking a few moments to focus on your breathing and deliberately release muscle tightness during the ${name} can have a profound calming effect on your nervous system.`,
        `Injury Prevention: Supple, well-stretched muscles are far less likely to suffer from sudden strains or tears. By regularly conditioning your tissues with the ${name}, you are building a resilient body that can handle unexpected physical demands safely.`
      ],
      steps: [
        `Find a Safe Starting Position: Begin in a comfortable, stable position on a non-slip surface, such as a yoga mat. Ensure you have enough space around you to move freely without obstruction.`,
        `Align Your Body: Take a moment to check your posture. Keep your spine neutral and your core slightly engaged to protect your lower back before initiating the movement.`,
        `Ease Into the Stretch: Slowly and gently move your body into the ${name} position. You should aim to feel a mild to moderate pulling sensation in the target muscle. Never force the movement or push to the point of sharp pain.`,
        `Hold and Breathe: Once you find the 'sweet spot' of tension, hold the position perfectly still for 15 to 30 seconds. Focus on taking slow, deep, rhythmic breaths. With each exhale, try to consciously relax the stretched muscle a tiny bit more.`,
        `Release and Repeat: Slowly release the stretch and return to your starting position. If the stretch targets one side of your body, immediately repeat the exact same sequence on the opposite side to ensure muscular balance.`
      ],
      mistakes: [
        `Bouncing or Jerking (Ballistic Stretching): One of the most common errors is bouncing during the stretch. This can trigger the muscle's stretch reflex, causing it to tighten up protectively and potentially leading to micro-tears. Always opt for a smooth, static hold.`,
        `Holding Your Breath: It is natural to tense up and hold your breath when experiencing discomfort. However, depriving your muscles of oxygen makes them harder to stretch. Focus on continuous, deep abdominal breathing to signal to your body that it is safe to relax.`,
        `Pushing Through Pain: Stretching should feel like a satisfying tension or a mild discomfort, never a sharp, shooting, or intense pain. If it hurts, you have gone too far. Ease back out of the stretch until you find a tolerable level of tension.`,
        `Ignoring Alignment: Sacrificing proper posture just to reach further into the stretch completely defeats the purpose and can strain adjacent joints. Focus on perfect form over extreme range of motion.`
      ],
      safety: [
        `Warm Up First: Never stretch completely cold muscles. Before performing the ${name}, do 5-10 minutes of light aerobic activity (like brisk walking or arm circles) to increase your core temperature and make your tissues more pliable.`,
        `Listen to Your Body: Everyone's flexibility is different, and your own flexibility can vary from day to day. Do not compare your range of motion to others or even to yourself on a different day. Respect your body's current limits.`,
        `Consult a Professional if Injured: If you are currently recovering from an injury, have chronic joint pain, or have recently undergone surgery, it is crucial to consult with a physical therapist or a qualified medical professional before attempting the ${name}.`,
        `Pregnancy Considerations: If you are pregnant, the hormone relaxin can make your joints unnaturally loose. Stretch very gently and avoid overextending your joints to prevent strain.`
      ]
    }
  };
}
