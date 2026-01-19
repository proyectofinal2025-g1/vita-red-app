const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const getSpecialitiesService = async () => {
    const response = await fetch(`${apiURL}/speciality`);

    if (!response.ok) {
        throw new Error('Error al obtener especialidades');
    }

    return response.json();
};