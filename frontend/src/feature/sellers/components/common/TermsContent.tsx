export default function TermsContent() {
  return (
    <div className="text-white space-y-8">
      {/* Introducción */}
      <p className="text-sm md:text-base leading-relaxed">
        El Plan de Puntos Mars (en adelante el <strong>"Plan"</strong>)
        constituye una declaración unilateral de voluntad en su modalidad de
        promesa de recompensa en términos de lo dispuesto en los artículos 1860,
        1861 y siguientes del Código Civil Federal. En virtud de lo anterior,{" "}
        <strong>
          Multi Market Services Communications México, S.A. de C.V.
        </strong>{" "}
        (en adelante, el <strong>"Organizador"</strong>) actuando por encargo de{" "}
        <strong>Effem México Inc y Compañía, S. en N.C. de C.V.</strong> (en
        adelante, el <strong>"Anunciante"</strong>), se obliga a otorgar el o
        los Artículos en favor de aquellos Participantes que, durante el Periodo
        de Comercialización, realicen Ventas Válidas del Producto excediendo la
        Base Estándar asignada, ello de conformidad con lo establecido en estos
        Términos y Condiciones.
      </p>
      <p className="text-sm md:text-base leading-relaxed">
        La obligación del Organizador nace desde la publicación de estos
        Términos y Condiciones y subsistirá durante toda la Vigencia del Plan.
        La intervención de los Participantes en el Plan no implica relación
        laboral, mercantil ni ningún otro tipo entre el Participante y/o el
        Anunciante y/o el Organizador, siendo el Distribuidor el único patrón
        del Participante.
      </p>

      {/* 1. Naturaleza */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          1. Naturaleza del Plan
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          El Plan constituye un esquema dirigido exclusivamente a incentivar a
          los empleados del Distribuidor a alcanzar mayores Ventas Válidas, por
          lo que no constituye una promoción dirigida al público consumidor en
          términos de la Ley Federal de Protección al Consumidor.
        </p>
      </section>

      {/* 2. Definiciones */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          2. Definiciones
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-4">
          Para efectos de estos Términos y Condiciones, se entenderá por:
        </p>
        <div className="space-y-4">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Anunciante
            </h3>
            <p className="text-sm leading-relaxed">
              Effem México Inc y Compañía, S. en N.C. de C.V., sociedad
              mercantil constituida conforme a las leyes mexicanas con domicilio
              en Camino a Tecualtitlan km 2, colonia Centro, C.P. 45950
              Poncitlán, Jalisco, México, quien es la patrocinadora del Plan y
              la responsable de proporcionar a los Participantes (a través de un
              tercero) los Artículos objeto del canje.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Organizador
            </h3>
            <p className="text-sm leading-relaxed">
              Multi Market Services Communications México, S.A. de C.V.,
              sociedad mercantil constituida conforme a las leyes mexicanas con
              domicilio en Av. Insurgentes Sur 716 (piso 4°), colonia del Valle
              Norte, alcaldía Benito Juárez, C.P. 03103, Ciudad de México,
              quien, por encargo del Anunciante, se encargará del desarrollo,
              gestión, organización y coordinación del Plan.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Distribuidor
            </h3>
            <p className="text-sm leading-relaxed">
              Es la sociedad mercantil que funge como patrón de los
              Participantes y responsable de:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Designar al Coordinador.</li>
              <li>
                Verificar que los empleados que deseen participar cumplan con
                los requisitos establecidos.
              </li>
              <li>
                Generar (a partir de su propia base de datos) la Base Estándar
                de cada Participante y proporcionarla al Anunciante para su
                ingreso a la Plataforma.
              </li>
              <li>
                A través del Coordinador, proporcionar el Aviso de Privacidad
                del Distribuidor y obtener el consentimiento de los
                Participantes.
              </li>
              <li>
                Validar e ingresar las Ventas Válidas realizadas por los
                Participantes en la Plataforma.
              </li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Coordinador
            </h3>
            <p className="text-sm leading-relaxed">
              Es el trabajador designado por el Distribuidor (que, en ningún
              caso, podrá ser Participante en el Plan), quien fungirá como
              enlace entre los Participantes con el Distribuidor y/o el
              Organizador. Sus responsabilidades incluyen: proporcionar los
              Términos y Condiciones y el Aviso de Privacidad; habilitar el
              acceso a la Plataforma; validar e ingresar las Ventas Válidas; y
              atender y resolver inconformidades.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Participante
            </h3>
            <p className="text-sm leading-relaxed">
              Aquella persona física que cumpla con los requisitos establecidos,
              que haya aceptado expresamente los Avisos de Privacidad, la Base
              Estándar y demás documentos aplicables, y que se encuentre
              debidamente registrada en la Plataforma con una cuenta de usuario
              activa.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Base Estándar
            </h3>
            <p className="text-sm leading-relaxed">
              Cifra mínima de unidades del Producto que el Participante debe
              comercializar; una vez superada tal cifra, el Participante
              empezará a generar puntos. La Base Estándar es generada por el
              Distribuidor considerando el historial de Ventas Válidas y no
              podrá ser modificada.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Plataforma
            </h3>
            <p className="text-sm leading-relaxed">
              Portal de internet administrado por el Organizador, en el cual los
              Participantes tendrán asignada una cuenta de usuario personal e
              intransferible para consultar sus datos, puntos acumulados,
              artículos disponibles y toda la información relacionada con su
              participación.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Venta Válida
            </h3>
            <p className="text-sm leading-relaxed">
              Únicamente generarán puntos las ventas que: (i) se traten del
              Producto referido, (ii) se haya realizado el pago efectivo del
              Producto y, (iii) la operación se haya efectuado de contado. En
              caso de devolución, se descontarán los puntos correspondientes.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
              Artículos
            </h3>
            <p className="text-sm leading-relaxed">
              Aquellos bienes referidos en la Plataforma con un valor específico
              en puntos para su canje. Están sujetos a disponibilidad y podrán
              variar sin previo aviso.{" "}
              <strong>
                Los Artículos no constituyen en ningún caso salario, prestación,
                condición de trabajo ni beneficio de carácter laboral o de
                seguridad social.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* 3. Cobertura */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          3. Cobertura Geográfica
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          El Plan es válido únicamente en la <strong>República Mexicana</strong>{" "}
          (el "Territorio").
        </p>
      </section>

      {/* 4. Vigencia */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          4. Vigencia
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          La vigencia del Plan iniciará el <strong>20 de abril del 2026</strong>{" "}
          y permanecerá vigente hasta el <strong>18 de julio de 2026</strong>{" "}
          (la "Vigencia").
        </p>
      </section>

      {/* 5. Medio para dudas */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          5. Medio para Dudas y Asistencia
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          A través de correo electrónico a la cuenta del Anunciante que se te
          proporcionará por parte de tu Coordinador.
        </p>
      </section>

      {/* 6. Requisitos */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          6. Requisitos para Participar
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-3">
          Podrán participar en el Plan aquellas personas que a la fecha de
          inicio de la Vigencia cumplan con los siguientes requisitos:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
          <li>
            Ser persona física mayor de edad y contar con identificación oficial
            vigente.
          </li>
          <li>
            Ser trabajador activo del Distribuidor, con contrato laboral
            formalmente celebrado y en vigor, sin encontrarse en periodo de
            incapacidad, suspensión o licencia.
          </li>
          <li>
            Desempeñar y tener asignado de manera formal el puesto de vendedor,
            conforme a los registros internos del Distribuidor.
          </li>
          <li>
            Haber leído, entendido y aceptado de manera expresa, en su totalidad
            y sin reserva alguna, los Avisos de Privacidad y los Términos y
            Condiciones del Plan.
          </li>
        </ul>
      </section>

      {/* 7. Restricciones */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          7. Restricciones para Participar
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-3">
          No podrán participar en el Plan las personas que se encuentren dentro
          de los siguientes supuestos:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
          <li>
            Aquellas que no sean mayores de edad o que no cuenten con
            identificación oficial vigente.
          </li>
          <li>
            Aquellas que no acepten de manera expresa los Avisos de Privacidad,
            los Términos y Condiciones y la Base Estándar.
          </li>
          <li>
            Aquellas que no sean trabajadores activos del Distribuidor o que se
            encuentren en periodo de incapacidad, suspensión, licencia o
            cualquier otra situación que implique la no ejecución efectiva de
            sus labores.
          </li>
          <li>
            Aquellas que, aun siendo trabajadores activos del Distribuidor, no
            tengan asignado formalmente el puesto de vendedor.
          </li>
          <li>
            Aquellas que incumplan disposiciones legales aplicables o las
            políticas internas del Distribuidor relacionadas con el Plan.
          </li>
        </ul>
      </section>

      {/* 8. Exclusión Laboral */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          8. Exclusión Laboral
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-3">
          Los Participantes reconocen y aceptan expresamente que:
        </p>
        <ul className="list-decimal pl-6 space-y-2 text-sm md:text-base">
          <li>
            No existe relación laboral ni subordinación con el Anunciante ni el
            Organizador; siendo el Distribuidor su único patrón conforme a la
            legislación aplicable.
          </li>
          <li>
            Los Artículos disponibles para canje no constituyen salario,
            incentivo, prestación, condición de trabajo ni beneficio económico
            de naturaleza laboral o de seguridad social.
          </li>
          <li>
            La única relación obrero-patronal que sostienen los Participantes es
            con el Distribuidor, conforme a su contrato de trabajo vigente.
          </li>
          <li>
            Los Participantes no tienen derecho alguno a prestaciones laborales
            o de seguridad social frente al Anunciante ni frente al Organizador.
          </li>
          <li>
            Cualquier controversia de carácter laboral deberá dirimirse
            exclusivamente entre el Participante y el Distribuidor conforme a la
            legislación aplicable.
          </li>
          <li>
            La participación en el Plan se realiza de manera voluntaria y
            personal, sin que pueda considerarse como condición de trabajo,
            obligación contractual o derecho adquirido.
          </li>
        </ul>
      </section>

      {/* 9. Desarrollo del Plan */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          9. Desarrollo del Plan
        </h2>

        <div className="space-y-6">
          {/* Etapa 1 */}
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold uppercase tracking-wide text-sm mb-2">
              Etapa 1 — Invitación para Participar
            </h3>
            <p className="text-sm leading-relaxed">
              El <strong>20 de abril de 2026</strong> se invitará a los
              empleados del Distribuidor que desempeñen el puesto de{" "}
              <em>vendedor</em> a participar en el Plan. Se les indicará la
              dinámica, los requisitos, restricciones y, en general, los
              términos y condiciones para participar.
            </p>
          </div>

          {/* Etapa 2 */}
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold uppercase tracking-wide text-sm mb-3">
              Etapa 2 — Inscripción y Alta en la Plataforma
            </h3>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li className="leading-relaxed">
                Los empleados con puesto de <em>vendedor</em> que deseen
                participar deberán informarlo al Coordinador, quien verificará
                que cumplan con los requisitos y les hará entrega de los
                presentes Términos y Condiciones y el Aviso de Privacidad del
                Distribuidor.
              </li>
              <li className="leading-relaxed">
                Una vez entregado el Aviso de Privacidad firmado, el
                Participante podrá (dentro de las 48 horas siguientes) ingresar
                a la Plataforma usando como <em>Usuario</em> su nombre completo
                y como <em>Contraseña</em> su fecha de nacimiento (dd/mmm/aaaa).
              </li>
              <li className="leading-relaxed">
                Al ingresar, el Participante deberá leer, entender y aceptar
                expresamente (a través de la casilla "Acepto"): (i) el Aviso de
                Privacidad, (ii) los Términos y Condiciones y, (iii) la Base
                Estándar. Si el Participante no los acepta, no podrá utilizar la
                Plataforma.
              </li>
            </ol>
          </div>

          {/* Etapa 3 */}
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold uppercase tracking-wide text-sm mb-3">
              Etapa 3 — Periodos de Comercialización
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              El <strong>26 de abril de 2026</strong> iniciará el Periodo de
              Comercialización. El periodo estará dividido en{" "}
              <strong>3 etapas de 4 semanas</strong> cada una. Durante las
              semanas 1, 2 y 3, los Participantes realizarán sus Ventas Válidas.
              En la semana 4, el Coordinador ingresará las ventas a la
              Plataforma y los Participantes podrán consultar y canjear sus
              puntos.
            </p>
            <div className="space-y-3">
              <div className="border border-white/20 rounded-lg p-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider mb-2">
                  Etapa 1: 26 de abril al 23 de mayo de 2026
                </h4>
                <ul className="text-xs space-y-1 text-white/80">
                  <li>Semana 1: 26 de abril — 02 de mayo</li>
                  <li>Semana 2: 03 de mayo — 09 de mayo</li>
                  <li>Semana 3: 10 de mayo — 16 de mayo</li>
                  <li>Semana 4: 17 de mayo — 23 de mayo (registro y canje)</li>
                </ul>
              </div>
              <div className="border border-white/20 rounded-lg p-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider mb-2">
                  Etapa 2: 24 de mayo al 20 de junio de 2026
                </h4>
                <ul className="text-xs space-y-1 text-white/80">
                  <li>Semana 1: 24 de mayo — 30 de mayo</li>
                  <li>Semana 2: 31 de mayo — 06 de junio</li>
                  <li>Semana 3: 07 de junio — 13 de junio</li>
                  <li>
                    Semana 4: 14 de junio — 20 de junio (registro y canje)
                  </li>
                </ul>
              </div>
              <div className="border border-white/20 rounded-lg p-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider mb-2">
                  Etapa 3: 21 de junio al 18 de julio de 2026
                </h4>
                <ul className="text-xs space-y-1 text-white/80">
                  <li>Semana 1: 21 de junio — 27 de junio</li>
                  <li>Semana 2: 28 de junio — 04 de julio</li>
                  <li>Semana 3: 05 de julio — 11 de julio</li>
                  <li className="font-medium">
                    Semana 4: 12 de julio — 18 de julio (solo canje; ventas no
                    acumulan puntos)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Etapa 4 */}
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold uppercase tracking-wide text-sm mb-3">
              Etapa 4 — El Canjeo
            </h3>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li className="leading-relaxed">
                Los Participantes podrán consultar dentro de la Plataforma un
                catálogo de Artículos, cada uno con un valor específico en
                puntos. El canjeo estará habilitado únicamente durante las{" "}
                <strong>semanas 4 de cada etapa</strong>. Los puntos son
                acumulables dentro del Periodo de Comercialización, pero
                caducarán al concluir el mismo.
              </li>
              <li className="leading-relaxed">
                Cuando el Participante desee canjear sus puntos, deberá
                seleccionar el Artículo en la Plataforma (lo que generará un
                bloqueo temporal) y completar el formulario correspondiente en
                un plazo máximo de <strong>5 minutos</strong>, proporcionando:
                (i) nombre completo, (ii) dirección de entrega y (iii) número de
                contacto.
              </li>
              <li className="leading-relaxed">
                La entrega de los Artículos se realizará a través de servicio
                especializado de paquetería. En caso de no ser posible la
                entrega tras dos intentos, el Artículo será entregado en las
                instalaciones del Distribuidor correspondiente.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* 10. Impuestos */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          10. Impuestos
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-3">
          El valor comercial de los Artículos canjeados por los Participantes
          dentro del Plan constituye, para efectos fiscales, un ingreso
          acumulable en especie en términos de la Ley del Impuesto sobre la
          Renta, quedando a cargo del Participante la obligación de declararlo
          en su base gravable.
        </p>
        <p className="text-sm md:text-base leading-relaxed mb-3">
          El Distribuidor se encargará de emitir el Comprobante Fiscal Digital
          por Internet (CFDI) correspondiente al valor del Artículo canjeado,
          conforme a las disposiciones fiscales vigentes.
        </p>
        <p className="text-sm md:text-base leading-relaxed">
          El Participante reconoce y acepta que es el único responsable del pago
          del ISR que le corresponda derivado de dicho ingreso, y que dichos
          ingresos no constituyen salario, prestación laboral ni condición de
          trabajo.
        </p>
      </section>

      {/* 11. Modificación */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          11. Modificación, Suspensión y Cancelación del Plan
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          El Organizador se reserva el derecho de modificar, suspender o
          cancelar el Plan, en cualquier momento, por causas justificadas,
          incluyendo caso fortuito o fuerza mayor, cambios operativos,
          disponibilidad de los Artículos o cualquier situación que afecte la
          viabilidad del Plan. En dichos supuestos, el Organizador procurará
          respetar los puntos acumulados por los Participantes hasta ese
          momento.
        </p>
      </section>

      {/* 12. Conductas fraudulentas */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          12. Conductas Fraudulentas
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          El Organizador podrá descalificar a cualquier Participante que incurra
          en conductas fraudulentas, manipulación de ventas, simulación de
          operaciones, alteración de registros o cualquier incumplimiento a los
          presentes Términos y Condiciones. En tales casos, el Participante
          perderá los puntos acumulados sin responsabilidad para el Organizador
          ni para el Anunciante.
        </p>
      </section>

      {/* 13. Disponibilidad */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          13. Disponibilidad y Sustitución de Artículos
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          Los Artículos estarán sujetos a disponibilidad. En caso de no
          disponibilidad de algún Artículo, el Organizador podrá sustituirlo por
          otro de valor y características similares, sin responsabilidad alguna.
        </p>
      </section>

      {/* 14. Ley aplicable */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          14. Ley Aplicable y Jurisdicción
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          Los presentes Términos y Condiciones se rigen e interpretan conforme a
          las leyes vigentes en los Estados Unidos Mexicanos. Para la
          interpretación y cumplimiento, las partes se someten expresamente a la
          jurisdicción y competencia de los tribunales competentes de la Ciudad
          de México, renunciando a cualquier otro fuero. Todo conflicto deberá
          agotar previamente el Procedimiento de Inconformidades como condición
          previa a cualquier acción judicial.
        </p>
      </section>

      {/* 15. Procedimiento de inconformidad */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          15. Procedimiento de Inconformidad
        </h2>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-2">
              Notificación
            </h3>
            <p className="text-sm leading-relaxed">
              Cualquier Participante que considere que existe un error en: (i)
              el cómputo de sus Ventas Válidas; (ii) la asignación o
              visualización de sus puntos; (iii) la disponibilidad de los
              Artículos en la Plataforma; o (iv) la entrega del Artículo
              canjeado; deberá notificarlo al Coordinador dentro de los{" "}
              <strong>tres (3) días hábiles</strong> siguientes. El Coordinador
              deberá acusar recibo dentro de las <strong>24 horas</strong>{" "}
              siguientes.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-2">
              Resolución por el Coordinador
            </h3>
            <p className="text-sm leading-relaxed">
              El Coordinador contará con <strong>cinco (5) días hábiles</strong>{" "}
              a partir de la recepción de la inconformidad para investigar y
              emitir una respuesta. Si la inconformidad es procedente, realizará
              las correcciones en la Plataforma dentro de los{" "}
              <strong>tres (3) días hábiles</strong> siguientes.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-2">
              Mesa de Atención del Plan
            </h3>
            <p className="text-sm leading-relaxed">
              Si el Participante no recibe respuesta del Coordinador o la
              respuesta no le resulta satisfactoria, podrá escalar su
              inconformidad directamente a la Mesa de Atención del Plan operada
              por el Organizador dentro de los{" "}
              <strong>tres (3) días hábiles</strong> siguientes. El Organizador
              resolverá la inconformidad escalada dentro de los{" "}
              <strong>diez (10) días hábiles</strong> siguientes. La resolución
              emitida por el Organizador será definitiva para efectos del Plan.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-2">
              Limitación Temporal
            </h3>
            <p className="text-sm leading-relaxed">
              El procedimiento de inconformidades estará disponible únicamente
              hasta el <strong>11 de julio de 2026</strong>. A partir de dicha
              fecha no se recibirán ni atenderán inconformidades relacionadas
              con el Plan.
            </p>
          </div>
        </div>
      </section>

      {/* 16. Responsabilidad */}
      <section>
        <h2 className="text-lg md:text-xl font-bold border-b border-white/20 pb-2 mb-3">
          16. Responsabilidad
        </h2>
        <p className="text-sm md:text-base leading-relaxed mb-3">
          El Organizador no tendrá responsabilidad alguna por:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
          <li>
            Daños y perjuicios de toda índole que puedan originarse por
            cualquier falla en la Plataforma, incluyendo la falta temporal de
            disponibilidad o el desabasto de los Artículos.
          </li>
          <li>
            Fallas en los equipos de computación, de comunicación, de suministro
            de energía, de líneas telefónicas, de la red de internet, por
            desperfectos técnicos, errores humanos o acciones de terceros.
          </li>
          <li>
            Por el mal uso de la Plataforma que los Participantes pudieran hacer
            de manera indebida o deliberada.
          </li>
          <li>Por causas ajenas a su control razonable.</li>
        </ul>
      </section>

      {/* Footer de aceptación */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-4 mt-8">
        <p className="text-sm font-bold text-white text-center">
          Al continuar, confirmas que has leído, entendido y aceptado la
          totalidad de los presentes Términos y Condiciones de Participación.
        </p>
        <p className="text-xs text-white/70 text-center mt-2">
          Última actualización: 09 de abril de 2026
        </p>
      </div>

      <div className="h-8" />
    </div>
  );
}
