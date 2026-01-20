import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function LeaderboardPage() {
    let users;
    try {
        users = await prisma.user.findMany({
            orderBy: { totalScore: 'desc' },
            take: 100,
        });
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Graceful degradation: return empty array instead of crashing
        users = [];
    }

    return (
        <div className="max-w-4xl mx-auto p-8 text-white">
            <h1 className="text-3xl font-bold mb-6 text-blue-500">Global Leaderboard</h1>

            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-400">
                        <tr>
                            <th className="p-4">Rank</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Tier</th>
                            <th className="p-4 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.address} className="border-t border-gray-800 hover:bg-gray-800/50">
                                <td className="p-4 font-mono text-gray-500">#{index + 1}</td>
                                <td className="p-4 font-mono">{user.ensName || user.address.slice(0, 6)}...</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                    ${user.tier === 'BASED' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                        {user.tier}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-bold text-xl">{user.totalScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
