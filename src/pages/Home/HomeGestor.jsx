import React from "react";

import Card from "../../components/Card";
import '../Home.css';

const HomeGestor = () => {
return (
    <div className='gestor_home'>
          <div className='home_hub'>
            <div className={'big_card'}>
              <Card
                name='Controles'
                singularName='control'
                href='controles'
                index={['Número', 'Nombre', 'Evidencias', 'Periodicidad', 'Auditorías en uso']}
                apiURL={'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getControlesData?id_empresa='}
              />
            </div>
            <div className={'small_card'}>
              <Card
                name='Auditorías'
                singularName='auditoría'
                href='auditorias'
                index={['Nombre', 'Progreso']}
                apiURL='https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getAuditorias?id_empresa='
              />
            </div>
            <div className={'big_card'}>
              <Card
                name='Responsables'
                singularName='responsable'
                href='responsables'
                index={['Nombre','Apellido', 'Título', 'email']}
                apiURL={'https://4qznse98v1.execute-api.eu-west-1.amazonaws.com/dev/getResponsablesData?id_empresa='}
              />
            </div>
          </div>
        </div>
)};

export default HomeGestor;

