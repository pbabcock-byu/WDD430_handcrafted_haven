import { getSellers } from "@/lib/queries";

export async function GET() {
    try {
        const sellers = await getSellers();
        return Response.json(sellers);
    } catch (error) {
        console.error('Error fetching sellers:', error);
        return new Response('Failed to load sellers', { status: 500})
    }
}