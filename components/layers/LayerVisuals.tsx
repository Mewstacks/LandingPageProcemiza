import type { LayerId } from "./layers.data";

const PLANE_PATH =
  "M74 30H625L721 75V242L648 290H92L39 249V81L74 30Z";

function PlaneBase({ children }: { children: React.ReactNode }) {
  return (
    <>
      <path className="layer-plane-depth" d="M39 233L92 274H648L721 226V242L648 290H92L39 249V233Z" />
      <path className="layer-plane-surface" d={PLANE_PATH} />
      <path className="layer-plane-edge" d={PLANE_PATH} />
      {children}
    </>
  );
}

export function LayerVisual({ id }: { id: LayerId }) {
  if (id === "origens") {
    return (
      <svg className="layer-visual layer-visual--origens" viewBox="0 0 760 320" aria-hidden="true">
        <PlaneBase>
          <g className="layer-muted">
            {[88, 122, 156, 190, 224].map((y, index) => (
              <path key={y} d={`M39 ${y}H${145 + index * 14}L${210 + index * 10} 160`} />
            ))}
            <rect x="207" y="126" width="112" height="68" />
            <rect x="354" y="108" width="52" height="104" />
            <rect x="430" y="108" width="52" height="104" />
          </g>
          <path className="layer-route" d="M39 156H154L221 160H319L380 160H482L535 160H721" />
          <circle className="layer-route-node" cx="221" cy="160" r="7" />
          <circle className="layer-route-node" cx="380" cy="160" r="7" />
          <path className="layer-paper" d="M536 125H658L691 142V178L658 195H536V125Z" />
        </PlaneBase>
      </svg>
    );
  }

  if (id === "regras") {
    return (
      <svg className="layer-visual layer-visual--regras" viewBox="0 0 760 320" aria-hidden="true">
        <PlaneBase>
          <g className="layer-muted layer-rule-bands">
            <rect x="104" y="84" width="272" height="34" />
            <rect x="104" y="132" width="332" height="34" />
            <rect x="104" y="180" width="232" height="34" />
            <rect x="104" y="228" width="300" height="25" />
          </g>
          <g className="layer-gates">
            <path d="M462 95L506 73L550 95L506 117L462 95Z" />
            <path d="M462 201L506 179L550 201L506 223L462 201Z" />
          </g>
          <path className="layer-route" d="M39 149H198L250 149L318 149L376 149L441 149L506 117V179L578 215H721" />
          <circle className="layer-route-node" cx="506" cy="117" r="6" />
          <circle className="layer-route-node" cx="506" cy="179" r="6" />
          <rect className="layer-paper" x="594" y="190" width="82" height="50" />
        </PlaneBase>
      </svg>
    );
  }

  if (id === "integracao") {
    return (
      <svg className="layer-visual layer-visual--integracao" viewBox="0 0 760 320" aria-hidden="true">
        <PlaneBase>
          <g className="layer-muted layer-integration-lines">
            <path d="M39 92H174L242 145" />
            <path d="M39 224H174L242 171" />
            <path d="M518 145L586 92H721" />
            <path d="M518 171L586 224H721" />
          </g>
          <g className="layer-nodes">
            <rect x="105" y="70" width="70" height="42" />
            <rect x="105" y="204" width="70" height="42" />
            <rect x="585" y="70" width="70" height="42" />
            <rect x="585" y="204" width="70" height="42" />
          </g>
          <path className="layer-core" d="M241 116H519V200H241V116Z" />
          <path className="layer-route" d="M39 158H241H519H721" />
          <path className="layer-route" d="M380 116V72" />
          <circle className="layer-route-node" cx="380" cy="158" r="7" />
          <path className="layer-paper" d="M326 128H434V188H326V128Z" />
        </PlaneBase>
      </svg>
    );
  }

  return (
    <svg className="layer-visual layer-visual--entrega" viewBox="0 0 760 320" aria-hidden="true">
      <PlaneBase>
        <g className="layer-muted layer-delivery-lines">
          <path d="M39 94H210L300 146" />
          <path d="M39 136H228L300 154" />
          <path d="M39 180H228L300 166" />
          <path d="M39 224H210L300 174" />
        </g>
        <path className="layer-paper" d="M300 112H542L614 147V177L542 212H300V112Z" />
        <path className="layer-route" d="M39 158H268L326 158H542L614 158H721" />
        <circle className="layer-route-node" cx="326" cy="158" r="7" />
        <g className="layer-output-slots">
          <rect x="649" y="128" width="45" height="11" />
          <rect x="649" y="151" width="45" height="11" />
          <rect x="649" y="174" width="45" height="11" />
        </g>
      </PlaneBase>
    </svg>
  );
}
