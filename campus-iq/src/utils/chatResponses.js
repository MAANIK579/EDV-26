export function generateResponse(msg) {
    const lower = msg.toLowerCase();
    const now = new Date();
    const h = now.getHours() % 12 || 12;
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

    if (lower.includes('time'))
        return `🕐 It's <strong>${h}:${now.getMinutes().toString().padStart(2, '0')} ${ampm}</strong> right now.`;
    if (lower.includes('next class') || lower.includes('schedule') || lower.includes('class'))
        return `📅 Your next class is <strong>Operating Systems</strong> at <strong>2:00 PM</strong> in <strong>Room 105</strong> with Prof. Singh.`;
    if (lower.includes('room') || lower.includes('available') || lower.includes('empty'))
        return `🚪 Right now, <strong>Room 314</strong>, <strong>Room 402</strong>, and <strong>Lab 302</strong> are available. Check the <strong>Room Tracker</strong> for live availability!`;
    if (lower.includes('cafeteria') || lower.includes('menu') || lower.includes('food'))
        return `🍽️ Today's lunch: <strong>Rajma Chawal</strong>, Roti, Salad. Snacks: Samosa, Cold Coffee. Open until 10 PM!`;
    if (lower.includes('library'))
        return `📚 <strong>Central Library</strong> is open until <strong>11 PM</strong>. 3 min walk. 50,000+ books + digital section.`;
    if (lower.includes('event') || lower.includes('hackathon'))
        return `🎉 Upcoming: <strong>Sports Day</strong> (Feb 28), <strong>AI/ML Lecture</strong> (Mar 3), <strong>Hackathon</strong> (Mar 15-16, ₹50K prize!)`;
    if (lower.includes('attendance'))
        return `📊 Overall: <strong>87%</strong>. DSA: 90% ✅, ML: 88% ✅, OS: 82% ⚠️, CN: 92% ✅, P&S: 85% ✅, Ethics: 95% ✅`;
    if (lower.includes('gpa') || lower.includes('grade'))
        return `🎓 CGPA: <strong>8.9</strong>. ML: A+ (92%), Ethics: A+ (95%), DSA: A (88%), OS: B+ (79%)`;
    if (lower.includes('bus'))
        return `🚌 Next buses: <strong>2:30 PM</strong> → City Center, <strong>3:15 PM</strong> → Railway Station, <strong>4:00 PM</strong> → City Center`;
    if (lower.includes('exam'))
        return `📝 Mid-Sems start <strong>March 10</strong>: DSA (10th), ML (12th), OS (14th), CN (17th). Library hours extended!`;
    if (lower.includes('weather'))
        return `🌤️ <strong>28°C</strong>, partly cloudy. Humidity 52%. Great day for outdoor activities!`;
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
        return `Hey Rahul! 👋 How can I help today? Ask about schedule, grades, events, rooms, or anything else!`;
    if (lower.includes('thank'))
        return `You're welcome! 😊 Always here to help!`;
    if (lower.includes('help'))
        return `I can help with: 📅 Schedule, 📊 Grades, 🎉 Events, 🍽️ Food, 🗺️ Navigation, 🚌 Bus, 📝 Exams, 🚪 Room availability, 🕐 Time`;

    return `I'd be happy to help! Try asking about your <strong>schedule</strong>, <strong>grades</strong>, <strong>events</strong>, <strong>available rooms</strong>, <strong>cafeteria menu</strong>, or <strong>bus times</strong>!`;
}
