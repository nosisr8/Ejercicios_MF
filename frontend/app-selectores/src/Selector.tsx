import type { ReactElement } from "react";
import { AutoComplete } from "@react-md/autocomplete";
import { useState } from "react";

export default function Selector(): ReactElement {

	const [datos, setDatos] = useState([
  		"Estacion de servicio",
		"Verduleria",
		"Farmacia"
	]);
	
	const agregarCategoria = (event: any) => {
		if (event.key === 'Enter'){
			let isFilter = datos.filter(function(d){
				if(d === event.target.value) return true
			})
			if(isFilter.length === 0){
				setDatos([...datos, event.target.value])
			}
		}
	};
	
  	return (
		<AutoComplete
		id="simple-autocomplete-1"
		label="Categorias"
		placeholder="Farmacia"
		data={datos}
		onKeyUp={(e) => agregarCategoria(e)}
		/>
  	);
}