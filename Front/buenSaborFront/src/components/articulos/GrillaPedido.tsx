import { useEffect, useState } from "react";
import Pedido from "../../models/Pedido";
import { Button, Modal, Table } from "react-bootstrap";
import { cancelarPedido, getPedidos, getPedidosByCliente, getPedidosByCocinero, getPedidosCancelados, updateEstadoPedido } from "../../services/PedidoApi";
import { UsuarioCliente } from "../../models/Usuario";
import { RolName } from "../../models/RolName";
import { ConfirmModal } from "./ConfirmModal";

export function GrillaPedido() {

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    //Modal detalles
    const [showModalDetalles, setShowModalDetalles] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
    //Estados del envio
    const [estadosEnvio] = useState<string[]>(["Recibido", "Aprobado", "En Preparacion", "Listo", "En camino", "Entregado", "Cancelado"])

    //estado para alternar entre obtener datos con eliminacion logica o no
    const [eliminados, setEliminados] = useState<boolean>(false);

    //Modal Confirmar eliminacion
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [jsonUsuario] = useState<any>(localStorage.getItem('usuario'));
    const usuarioLogueado: UsuarioCliente = JSON.parse(jsonUsuario) as UsuarioCliente;

    const getListaPedidos = async () => {
        let datos: Pedido[] = []
        if (usuarioLogueado && usuarioLogueado.rol.rolName == RolName.CLIENTE) {
            datos = await getPedidosByCliente(usuarioLogueado.cliente.id)
        } else if (usuarioLogueado && usuarioLogueado.rol.rolName == RolName.COCINERO) {
            datos = await getPedidosByCocinero()
        } else if (eliminados) {
            datos = await getPedidosCancelados();
        } else {
            datos = await getPedidos();
        }
        setPedidos(datos);
    };

    const handleShowDetalles = (pedido: Pedido) => {
        setSelectedPedido(pedido)
        setShowModalDetalles(true);

    }

    const handleCloseDetalles = () => {
        setShowModalDetalles(false);
        setSelectedPedido(null);
    };

    const handleEstadoChange = async (pedido: Pedido, e: string) => {
        // Guardar el cambio
        await updateEstadoPedido(pedido.id, e);

        // Actualizar la lista
        getListaPedidos();
    };

    const handleConfirmClose = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        handleConfirmClose();
    };

    const confirmUpdateEstadoDelete = (idUMedida: number) => {
        setConfirmAction(() => () => updateEstadoDelete(idUMedida));
        setConfirmMessage(`¿Está seguro que desea cancelar el pedido?`);
        setShowConfirmModal(true);
    };

    const updateEstadoDelete = async (id: number) => {

        console.log(id)

        await cancelarPedido(id);
        getListaPedidos();
    }

    useEffect(() => {
        getListaPedidos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eliminados]);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'top', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
                <h1 style={{ marginTop: '20px', color: "whitesmoke", backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '15px 15px' }}>{eliminados ? "Pedidos Cancelados" : "Pedidos"}</h1>



                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Nro Pedido</th>
                            <th>Fecha pedido</th>
                            <th>Hora estimada de finalizacion</th>
                            <th>Total</th>
                            <th>Total costo</th>
                            <th>Estado</th>
                            <th>Opciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map((pedido: Pedido) =>
                            <tr key={pedido.id}>
                                <td>{String(pedido.id).padStart(5, '0')}</td>
                                <td>{pedido.fechaPedido}</td>
                                <td>{pedido.horaEstimadaFinalizacion}</td>
                                <td>{pedido.total}</td>
                                <td>{pedido.totalCosto}</td>
                                <td>
                                    <select value={pedido.estado} onChange={(e) => handleEstadoChange(pedido, e.target.value)} disabled={eliminados}>
                                        {estadosEnvio.map((estado, index) =>
                                            <option key={index} value={estado}>{estado}</option>
                                        )}
                                    </select>

                                </td>

                                <td>
                                    <Button variant="outline-success" style={{ maxHeight: "40px", marginRight: '10px' }} onClick={() => handleShowDetalles(pedido)}>Detalle</Button>
                                    {
                                        (usuarioLogueado && usuarioLogueado.rol && usuarioLogueado.rol.rolName == RolName.ADMIN) &&
                                        <>
                                            {
                                                !eliminados && pedido.estado !== "Cancelado" &&
                                                <Button variant="outline-danger" style={{ maxHeight: "40px" }}
                                                    onClick={() => confirmUpdateEstadoDelete(pedido.id)}>Cancelar</Button>
                                            }
                                        </>
                                    }
                                </td>

                            </tr>
                        )}
                    </tbody>
                </Table>
                <div style={{ width: '100%', display: "flex", justifyContent: 'flex-end' }}>
                    <Button size="lg" style={{ margin: 10, backgroundColor: '#478372', border: '#478372' }} onClick={() => { setEliminados(!eliminados) }}>
                        {eliminados ? "Ver Actuales" : "Ver Cancelados"}
                    </Button>
                </div>

                <ConfirmModal
                    show={showConfirmModal}
                    handleClose={handleConfirmClose}
                    handleConfirm={handleConfirm}
                    message={confirmMessage}
                />


                {
                    <Modal show={showModalDetalles} onHide={handleCloseDetalles}>
                        <Modal.Header closeButton>
                            <Modal.Title>Detalles del pedido</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                            {selectedPedido &&
                                <>
                                    <p>{<h5><span style={{ fontWeight: 'bold' }}>Fecha </span> </h5>}</p>
                                    <p>{<span style={{ fontWeight: 'bold' }}></span>} {selectedPedido.fechaPedido}</p>
                                    <p>{<h5><span style={{ fontWeight: 'bold' }}>Hora del pedido </span> </h5>}</p>
                                    <p>{<span style={{ fontWeight: 'bold' }}></span>} {selectedPedido.horaEstimadaFinalizacion}</p>
                                    <p>{<h5><span style={{ fontWeight: 'bold' }}>Detalle del pedido </span> </h5>}</p>

                                    {selectedPedido && selectedPedido.pedidoDetalles.map((detalle) => (
                                        <p key={detalle.id}>


                                            <p>{<span style={{ fontWeight: 'bold' }}></span>}  {detalle.articulo.denominacion}</p>

                                            <img style={{ maxWidth: "80px", objectFit: "contain" }}
                                                className="cart-img"
                                                src={`${detalle.articulo.imagenes[0].url}`}
                                                alt={detalle.articulo.denominacion}
                                            /> <br /> <br />
                                            <h5 style={{ fontWeight: 'bold' }}>Cantidad:</h5> {detalle.cantidad} <br />
                                            <h5 style={{ fontWeight: 'bold' }}>Subtotal:</h5> {detalle.subTotal}<br />

                                            <hr />
                                        </p>
                                    ))}
                                    <h4 style={{ fontWeight: 'bold' }}>Total:</h4> {selectedPedido.total}
                                </>
                            }

                        </Modal.Body>


                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDetalles}>
                                Cerrar
                            </Button>
                        </Modal.Footer>
                    </Modal>
                }
            </div>
        </>
    );
}