export default function PrivacyContent() {
  return (
    <div className="text-white space-y-8">
      {/* Introducción */}
      <p className="text-sm md:text-base leading-relaxed">
        En el marco de la{" "}
        <strong>
          Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares
        </strong>{" "}
        (la "Ley"), le solicitamos como titular leer el aviso de privacidad que
        a continuación se detalla.
      </p>
      <p className="text-sm md:text-base leading-relaxed">
        <strong>Effem México Inc y Compañía, S. en N.C. de C.V.</strong> (el
        "Responsable"), con domicilio en{" "}
        <em>
          Camino a Tecualtitlan km 2, colonia Centro, C.P. 45950 Poncitlán,
          Jalisco, México
        </em>
        , es responsable de recabar sus datos personales, así como del uso,
        protección, almacenamiento o divulgación que se le dé a los mismos (el
        "Tratamiento").
      </p>
      <p className="text-sm md:text-base leading-relaxed">
        Su información personal será recabada, almacenada, procesada,
        organizada, analizada y transferida por el Responsable en los términos
        del presente aviso.
      </p>

      {/* 1. Datos personales */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          1. Datos Personales que se Recaban
        </h2>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm md:text-base leading-relaxed">
            Se recabarán los siguientes datos personales, para los cuales usted
            otorga al Responsable su consentimiento expreso para su Tratamiento:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-sm md:text-base">
            <li>Nombre completo</li>
            <li>Fecha de nacimiento</li>
            <li>Dirección</li>
            <li>Correo electrónico</li>
          </ul>
        </div>
      </section>

      {/* 2. Finalidad */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          2. Finalidad y Uso de los Datos Personales
        </h2>
        <div className="space-y-4">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-2">
              Finalidad Primaria
            </h3>
            <p className="text-sm md:text-base leading-relaxed">
              Verificar su identidad y cumplir con las obligaciones del
              Responsable derivadas de la Dinámica, incluyendo la validación de
              ganador y entrega del premio, así como la atención de dudas y
              sugerencias y seguimiento a sus solicitudes.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-2">
              Finalidad Secundaria
            </h3>
            <p className="text-sm md:text-base leading-relaxed">
              Inscribir al Titular en el Programa de Lealtad y enviar correos
              electrónicos con información y publicidad del mismo.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/30">
            <p className="text-sm leading-relaxed">
              <strong>Importante:</strong> Usted puede manifestar dentro de los{" "}
              <strong>5 (cinco) días hábiles</strong> siguientes a la recepción
              del presente aviso de privacidad, su <strong>negativa</strong>{" "}
              para el Tratamiento de sus datos personales con finalidad
              secundaria, mediante la Solicitud correspondiente (ver sección de
              Derechos ARCO).
            </p>
          </div>
        </div>
        <p className="text-sm md:text-base leading-relaxed mt-4">
          Una vez cumplidas las finalidades del Tratamiento, el Responsable
          realizará el bloqueo, cancelación y supresión de los datos en su
          posesión.
        </p>
      </section>

      {/* 3. Seguridad */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          3. Seguridad de los Datos Personales
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-xs font-bold">
              ✓
            </span>
            <p className="text-sm md:text-base leading-relaxed">
              El Responsable implementará las medidas de seguridad necesarias
              para procurar la protección de sus datos personales para evitar su
              daño, pérdida, alteración, destrucción o el uso, acceso o
              tratamiento no autorizado, de conformidad con lo establecido en la
              Ley, el Reglamento y los Lineamientos.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-xs font-bold">
              ✓
            </span>
            <p className="text-sm md:text-base leading-relaxed">
              Únicamente el personal designado y autorizado por el Responsable
              podrá participar en el Tratamiento de sus datos personales. Dicho
              personal tiene prohibido dar acceso a personas no autorizadas y
              utilizar sus datos personales para fines distintos a los
              establecidos en el presente aviso.
            </p>
          </li>
        </ul>
      </section>

      {/* 4. Derechos ARCO */}
      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          4. Derechos que le Corresponden Respecto a sus Datos Personales
        </h2>

        <div className="bg-white/10 rounded-xl p-4">
          <h3 className="font-bold text-sm uppercase tracking-wide mb-3">
            El titular de los datos personales (el "Titular"), mediante solicitud
            enviada al correo electrónico del Responsable o a su domicilio (la
            "Solicitud"), podrá:
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              Ejercer su derecho de acceder, rectificar y cancelar sus datos personales, así como el de oponerse al Tratamiento de los mismos (“Derechos ARCO“). 
            </li>
            <li>
              Limitar el uso de sus datos (“Derecho de Limitación”). 
            </li>
            <li>
              Revocar el consentimiento al Tratamiento de los datos que para los fines referidos se haya otorgado (“Derecho de Revocación”).
            </li>
          </ul>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <h3 className="font-bold text-sm uppercase tracking-wide mb-3">
            La Solicitud deberá contener y acompañar lo siguiente:
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              El nombre completo del Titular y su domicilio o cualquier otro
              medio por el cual desee recibir notificaciones.
            </li>
            <li>
              Los documentos que acrediten su identidad como Titular, a través
              de la presentación de copia de su documento de identificación
              oficial (después de haber exhibido el original para su cotejo).
            </li>
            <li>
              La descripción clara y precisa de los datos personales respecto de
              los que busca ejercer cualquiera de los derechos señalados.
            </li>
            <li>
              Cualquier elemento o documento que facilite la localización de los
              datos personales del Titular.
            </li>
            <li>
              En caso específico de solicitud de <strong>rectificación</strong>,
              el Titular deberá indicar las modificaciones a realizarse y
              aportar la documentación que sustente su petición.
            </li>
          </ul>
        </div>

        <p className="text-sm md:text-base leading-relaxed mt-4">
          El Responsable responderá a través del medio señalado por el Titular
          en la Solicitud, dentro de los{" "}
          <strong>20 (veinte) días hábiles</strong> siguientes a su recepción.
        </p>
        <p className="text-sm md:text-base leading-relaxed mt-2">
          El Responsable podrá conservar los datos personales del Titular
          exclusivamente para efectos de las responsabilidades nacidas del
          Tratamiento.
        </p>
      </section>

      {/* 5. Transmisión y transferencia */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          5. Transmisión y Transferencia de Datos Personales
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-4">
          Los Datos Personales del Titular pueden ser transferidos y tratados
          con sociedades filiales y demás sociedades del mismo grupo comercial,
          clientes y proveedores del Responsable.
        </p>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm leading-relaxed">
            <strong>Consentimiento implícito:</strong> Si no manifiesta su
            oposición para que los Datos Personales sean transferidos, se
            entenderá que a la firma del presente Aviso de Privacidad el Titular
            ha otorgado al Responsable su{" "}
            <strong>consentimiento expreso</strong> para su transmisión.
          </p>
          <p className="text-sm leading-relaxed mt-2 text-white/80">
            Nota: Los Datos Personales Patrimoniales sólo serán transmitidos con
            el previo consentimiento por escrito del Titular.
          </p>
        </div>
      </section>

      {/* 6. Cambios al aviso */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          6. Cambios al Aviso de Privacidad
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          En caso de modificaciones al presente aviso, se pondrá a su
          disposición la versión actualizada del mismo mediante el envío de un
          correo electrónico a la dirección que tenga registrada en la
          Plataforma.
        </p>
      </section>

      {/* Declaración de consentimiento */}
      <div className="bg-white/10 border border-white/30 rounded-xl p-5 mt-8 space-y-3">
        <p className="text-sm md:text-base leading-relaxed italic">
          El Titular manifiesta que ha leído y entiende el presente aviso y
          otorga su consentimiento para el Tratamiento de sus datos personales,
          para las finalidades aquí señaladas, así como para la transferencia de
          los mismos, en los términos del presente.
        </p>
        <p className="text-sm md:text-base leading-relaxed italic">
          Asimismo, manifiesta que sus datos personales son exactos, auténticos
          y completos y por lo tanto reconoce que es el único responsable de la
          exactitud, veracidad y autenticidad de sus datos personales.
        </p>
        <p className="text-xs text-white/70 text-right pt-2 border-t border-white/20">
          Fecha de última actualización: 06 de abril de 2026.
        </p>
      </div>

      <div className="h-8" />
    </div>
  );
}
