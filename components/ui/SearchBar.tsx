type City = {
    codigo: string;
    nombre: string;
}

type MobileSearchBarProps = {
    startDate: Date;
    endDate: Date;
    origin: City;
    destination: City;
    stage: number;
    petAllowed: boolean;
    setStage: Function;
}

export default function MobileSearchBar(props:MobileSearchBarProps) {
}