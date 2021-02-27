<?php

defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * @subpackage  Rest API
 * @category    Controller
 */
require APPPATH . '/libraries/webservices/REST_Controller.php';
require APPPATH . '/libraries/webservices/Message.php';

class Auth extends REST_Controller {

    function __construct() {
        parent::__construct();
        ob_clean();
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: text/html; charset=utf-8');
        $this->load->model('webservice/auth_mod');
        $this->load->model('webservice/sms_log_model');
        $this->load->model('webservice/mpeasa_payment_model');
        $this->load->model('webservice/customer_payment_model');
        $this->load->model('webservice/user_model');
        $this->load->helper(['jwt', 'authorization']);
        $this->load->library('webservices/format');

        //load S3 library for aws cloud save data 
        $this->load->library('S3');
        $this->load->library('mpesa');
    }

    /* start function to sugnup user */

    function get_address_get() {
        $address = getLatLong(28.609830, 77.367500);
    }

    function test_ewallet_sms_get() {
        $requestURL = "http://bulksmstz.com/API/V1/";

        $postData = array(
            'username' => 'jeevan',
            'password' => '123@jeevan',
            'request' => 'send',
            'recipients' => array(255567123456),
            'sms' => 'This is test jeevan',
            'sender' => '12345'
        );

        $postData = json_encode($postData);

        $opts = array(
            'http' => array(
                'method' => 'POST',
                'header' => 'Content-Type: application/json' . "\r\n"
                . 'Content-Length: ' . strlen($postData) . "\r\n",
                'content' => $postData,
            ),
        );
        $context = stream_context_create($opts);

        $result = file_get_contents($requestURL, false, $context);

        $response = json_decode($result);
        pr($response);
        die;

        if ($response->status = 'success') {
            $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Congrats! You are signup successfully.', 'data' => $res['result']);
            $this->response($success);
        } else {
            
        }
    }

    function signup_post() {
        header('Access-Control-Allow-Origin: *');

        $this->form_validation->set_rules('user_name', "user Name", 'trim|required|max_length[50]',array('max_length' => 'The maximum size of the name will be 50 characters'));

         $this->form_validation->set_rules('address', "Address", 'trim|max_length[200]',array('max_length' => 'The maximum size of the address will be 200 characters'));

        $this->form_validation->set_rules('mobile_number', "Mobile Number", 'trim|required|min_length[9]|max_length[20]');

        $this->form_validation->set_rules('password', "Password", 'trim|required|min_length[6]|max_length[18]');



        if ($this->form_validation->run() === true) {

            $ms = "select id from tbl_users where mobile_number = '$mobile_number' and user_type = '3'";
            $row = $this->db->query($ms)->row();

            if (!empty($row->id)) {

                $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Mobile number already exist', 'data' => null);
                $this->response($error);
                return;
            }


            $tokenData = 'user_' . $_POST['password'];
            // Create a token
            $token = AUTHORIZATION::generateToken($tokenData);
            // this code is write here to call the signup user for authorization.
            $res = $this->auth_mod->signup_user();
            //pr($res['result']['token']="abc"); die;
            if (@$res['status'] == 'success') {
                $res['result']->token = $token;
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Congrats! You are signup successfully.', 'data' => $res['result']);
                $this->response($success);
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Oops! Please enter valid argument.', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* start function to signup user */


    /* start function to re-send otp */

    function check_phone_number_change_password_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('mobile_number', "Mobile Number", 'trim|required|min_length[9]|max_length[20]');
        $this->form_validation->set_rules('password', "Password", 'trim|required');
        if ($this->form_validation->run() === true) {
            $mobile_number = $this->input->post('mobile_number');
            // this code is write here to call the resend otp here.
            $res = $this->auth_mod->check_phone_number_change_password($mobile_number);
            //pr($res); die;
            if (@$res['status'] == 'success') {
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['mag'], 'data' => $res['result']);
                $this->response($success);
            } else { //pr($res['msg']); die;
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* End Function to re-send otp */

    /* start function to re-send otp */

    function resend_otp_post() {
        header('Access-Control-Allow-Origin: *');
        if (is_numeric(@$_POST['username'])) {
            $this->form_validation->set_rules('username', "Mobile Number", 'trim|required|numeric|min_length[9]|max_length[20]');
        } else {
            $this->form_validation->set_rules('username', "Email", 'trim|required');
        }
        if ($this->form_validation->run() === true) {
            $username = $this->input->post('username');

            // this code is write here to call the resend otp here.
            $res = $this->auth_mod->resend_otp($username);
            // pr('ajay'); die;
            if (@$res['status'] == 'success') {
                if (is_numeric($_POST['username'])) {
                    
                } else {
                    $email_data['to'] = $res['result']->email;
                    $email_data['from'] = 'jeera.update@maxtratechnologies.in';
                    $email_data['sender_name'] = "Ring Money Admin";
                    $email_data['subject'] = "Ring Money :: OTP Send Successfully";
                    $email_data['message'] = array('header' => 'OTP send Successfully',
                        'body' => 'Dear ' . $res['result']->user_name . ',<br/>OTP : ' . $res['result']->otp . '<br/><br/><br><br>Thanks,<br/>Team Ring Money');
                    //_sendMail($email_data);
                }
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['mag'], 'data' => $res['result']);
                $this->response($success);
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['mag'], 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* End Function to re-send otp */



    /* this function is used to verify the otp */

    function verify_otp_post() {
        header('Access-Control-Allow-Origin: *');
        if (is_numeric(@$_POST['username'])) {
            $this->form_validation->set_rules('username', "Mobile Number", 'trim|required|numeric|min_length[10]|max_length[10]');
        } else {
            $this->form_validation->set_rules('username', "Email", 'trim|required');
        }
        $this->form_validation->set_rules('otp', "Otp", 'trim|required');
        if ($this->form_validation->run() === true) {

            $username = $this->input->post('username');
            $otp = $this->input->post('otp');
            //pr($otp); die;
            // this code is write here to call the Auth_mod to check othrization.
            $res1['username'] = $username;
            $res1['otp'] = $otp;
            $res['status'] = 'success';
            $res = $this->auth_mod->otp_verify($username, $otp);
            if (@$res['status'] == 'success') {
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Verify OTP successfully', 'data' => $res1);
                $this->response($success);
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Please enter valid OTP', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            if (strcmp($error_msg, '<p>The Mobile number field must contain a unique value.</p>')) {
                $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Mobile number already exit !", 'data' => null);
                $this->response($error);
            } else {
                $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
                $this->response($error);
            }
        }
    }

    /* end function to verify otp */


    /* start function to verify user request */

    private function verify_request() {
        // Get all the headers
        $headers = $this->input->request_headers();
        // Extract the token
        if (isset($headers['Authorization'])) {
            $token = @$headers['Authorization'];
        } else {
            $token = @$_POST['Authorization'];
        }
        // Use try-catch
        // JWT library throws exception if the token is not valid
        try {
            // Validate the token
            // Successfull validation will return the decoded user data else returns false
            $data = AUTHORIZATION::validateToken($token);
            if ($data === false) {
                $res['responcCode'] = 401; //parent::HTTP_UNAUTHORIZED;
                return $res;
                //$response = ['status' => $status, 'msg' => 'Unauthorized Access!'];
                //$this->response($response, $status);
                //exit();
            } else {
                $res['responcCode'] = 200;
                //$res['result'] = $data;
                return $res;
            }
        } catch (Exception $e) {
            // Token is invalid
            // Send the unathorized access message
            $res['responcCode'] = 401; //parent::HTTP_UNAUTHORIZED;
            return $res;
            //$response = ['status' => $status, 'msg' => 'Unauthorized Access! '];
            //$this->response($response, $status);
        }
    }

    /* end function to verify user request */

    public function login_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('password', "Password", 'trim|required|min_length[8]|max_length[20]');

        $this->form_validation->set_rules('username', "username", 'trim|required');

        if ($this->form_validation->run() === true) {
            $tokenData = 'user_' . $_POST['password'];
            // Create a token
            $token = AUTHORIZATION::generateToken($tokenData);
            // this code is write here to call the Auth_mod to check othrization.
            //pr($_POST); die;
            $res = $this->auth_mod->login_authorization($token);
            //pr($res['error_msg']); die;
            if (@$res['status'] == 'success') {
                $res['result']->token = $token;
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Welcome you are login successfully', 'data' => $res['result']);
                $this->response($success);
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['error_msg'], 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* start function to forget password */

    function forgot_password_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('username', "User Name", 'trim|required');
        if ($this->form_validation->run() === true) {
            $username = $this->input->post('username');
            // this code is write here to call the forgot password.
            $res = $this->auth_mod->forgot_password($username);
            //pr($res['result']->email); die;
            if ($res) {
                $email_data['to'] = $res['result']->email;
                $email_data['from'] = 'jeera.update@maxtratechnologies.in';
                $email_data['sender_name'] = "Ring Money Admin";
                $email_data['subject'] = "Ring Money :: Forgot password Successfully";
                $email_data['message'] = array('header' => 'Forgot password Successfully',
                    'body' => 'Dear ' . $res['result']->user_name . ',<br/>password : ' . $res['result']->decrypt_password . '<br/><br/><br><br>Thanks,<br/>Team Ring Money');
                //_sendMail($email_data);    
            }
            //pr($res); die;
            if (@$res['status'] == 'success') {
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Password send your mail successfully', 'data' => $res['result']);
                $this->response($success);
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Password not forgot successfully', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* End Function to forget password */


    /* start function to get user details */

    function get_user_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "user id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $user_id = $this->input->post('user_id');

            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->get_user_date_by_id($user_id);
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Get user data successfully', 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'User data not found !', 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* End Function to get user details */



    /* start function to update profile details */

    function update_profile_post() { //pr($_POST); die;
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "user id", 'trim|required');

        $this->form_validation->set_rules('user_name', "User Name", 'trim|required|max_length[50]', array('max_length' => 'The maximum size of the name will be 50 characters'));

        $this->form_validation->set_rules('address', "Address", 'trim|max_length[200]',array('max_length' => 'The maximum size of the address will be 200 characters'));

       $this->form_validation->set_rules('email', "Email", 'trim|required');

        $this->form_validation->set_rules('mobile_number', "Mobile", 'trim|required|min_length[9]|max_length[20]');

        if ($this->form_validation->run() === true) {
            $user_id = $this->input->post('user_id');
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to call the Auth_mod to check othrization.      
                // this code is write here to call the resend otp here.

                $res = $this->auth_mod->update_profile($user_id);

                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $res['result']->token = $_POST['Authorization'];
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Profile update successfully', 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Profile not update successfully', 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* End Function to update profile details */


    /* start function to change password */

    function change_password_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('old_password', "Old Password", 'trim|required');
        $this->form_validation->set_rules('new_password', "New Password", 'trim|required|min_length[6]|max_length[20]');
        $this->form_validation->set_rules('confirm_password', 'Confirm Password', 'required|matches[new_password]');
        if ($this->form_validation->run() === true) {
            $user_id = $this->input->post('user_id');
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                //pr($_POST); die;
                // this code is write here to call the forgot password.
                $res = $this->auth_mod->change_password($user_id);

                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to change password */

    function get_coupon_list_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $user_id = $this->input->post('user_id');

            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->get_coupon_list($user_id);
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function get_coupon_details_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('coupon_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $coupon_id = $this->input->post('coupon_id');

            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->get_coupon_details($coupon_id);
                // pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* start function to add feedback */

    function rating_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('rating', "Rating", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
                $res = $this->auth_mod->rating();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to add feedback */



    /* Start Get csm content function */

    public function get_cms_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('page_url', 'page url', 'trim|required');
        if ($this->form_validation->run() === true) {
            $page_url = $this->input->post('page_url');
            $data = $this->auth_mod->get_content_data($page_url);
            // pr($data); die;
            if ($data['status'] == 'success') {
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseStatus' => 'Get contant Successfully !', 'data' => $data['result']);
                $this->response($success);
            } else {
                $error = array('responseCode' => '400', 'responseStatus' => 'error', "responseMessage' => 'CMS dose not exit !", 'data' => null);
                $this->response($error);
            }
        } else {
            $result['error_msg'] = validation_errors();
            //$result = json_encode($result);
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $result);
            $this->response($error);
        }
    }

    /* End get contant function end */

    /* Start Get faq content function */

    public function get_faq_post() {
        header('Access-Control-Allow-Origin: *');
        $data = $this->auth_mod->get_faq_data();
        // pr($data); die;
        if ($data['status'] == 'success') {
            $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseStatus' => 'Get FAQ List Successfully !', 'data' => $data['result']);
            $this->response($success);
        } else {
            $error = array('responseCode' => '400', 'responseStatus' => 'error', "responseMessage' => 'No Data Found", 'data' => null);
            $this->response($error);
        }
    }

    /* End get faq contant function end */

    /* start function to get wallet amount and respect to wallet history */

    function get_wallet_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                $user_id = $_POST['user_id'];
                // this code is write here to rate the .
                //$res['release_amount'] = $this->manufacture_mod->release_amount();
                $res['wallet_amount_list'] = $this->auth_mod->fetch_wallet_amount($user_id);
               // pr($res);die;
                $res['wallet_history'] = $this->auth_mod->fetch_wallet_transaction($user_id, $_POST['page'], $_POST['per_page']);
               // pr($res); die; //http://182.76.237.227/~apitest
                if (@$res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Wallet amount get successfully", 'data' => $res);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No Wallet Found", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to get wallet amount and respect to wallet history */




    /* start function to add feedback */

    function add_wallet_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('amount', "Amount", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
                $res = $this->auth_mod->add_wallet();
                
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to add feedback */

    function get_offer_list_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $user_id = $this->input->post('user_id');

            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->get_offer_list($user_id);
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function get_offer_details_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('offer_id', "Offer id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $offer_id = $this->input->post('offer_id');

            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->get_offer_details($offer_id);
                // pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function apply_coupon_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('amount', "Amount", 'trim|required');
        $this->form_validation->set_rules('coupon_code', "Coupon Code", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->apply_coupon();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function get_notification_list_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->get_notification_list();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function get_notification_details_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('notification_id', "Notification id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->get_notification_details();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function view_notification_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('notification_id', "Notification Id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->view_notification();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function view_ads_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('ads_id', "Ads id", 'trim|required');

        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                $adsId = $_POST['ads_id'];
                // this code is wxrite here to call the resend otp here.
                $res = $this->auth_mod->view_ads();
                //pr($res); die;
                if (@$res['status'] == 'success') {

                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function recipt_uploads_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('booking_id', "Booking id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->recipt_uploads();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* start function to get wallet amount and respect to wallet history */

    function get_ads_list_with_rewards_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
//        pr($_POST);die;
        if ($this->form_validation->run() === true) {

//            pr($_POST);die;
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                $user_id = $_POST['user_id']; //pr($_POST); die;
                // this code is write here to rate the .
                //$res['release_amount'] = $this->manufacture_mod->release_amount();
                $res['rewards'] = $this->auth_mod->get_total_rewords($user_id);
                $res['notification'] = $this->auth_mod->get_notification_data($user_id);
                $res['ads_list'] = $this->auth_mod->get_ads_list($user_id, $_POST['page'], $_POST['per_page']);
                //    pr($res); die; //http://182.76.237.227/~apitest
                if (@$res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Wallet amount get successfully", 'data' => $res);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No Wallet Found", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to get wallet amount and respect to wallet history */


    /* start function to get wallet amount and respect to wallet history */

    function get_ads_details_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('ads_id', "Ads id", 'trim|required');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');

        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                $ads_id = $_POST['ads_id']; //pr($_POST); die;
                $user_id = $_POST['user_id']; //pr($_POST); die;
                // this code is write here to rate the .
                $res['ads_details'] = $this->auth_mod->get_ads_details($ads_id, $user_id);
                //pr($res['ads_details']); die;
                if (@$res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Ads Details get Successfully", 'data' => $res['ads_details']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No Ads Found", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to get wallet amount and respect to wallet history */

    /* start function to get wallet amount and respect to wallet history */

    function get_rewards_list_with_total_rewords_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                $user_id = $_POST['user_id']; //pr($_POST); die;
                // this code is write here to rate the .
                //$res['release_aNew Adsmount'] = $this->manufacture_mod->release_amount();
                $res['rewards'] = $this->auth_mod->get_total_rewords($user_id);
                
                $res['ads_list'] = $this->auth_mod->get_rewords_list($user_id, $_POST['page'], $_POST['per_page']);
                //    pr($res); die; //http://182.76.237.227/~apitest
                if (@$res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "No reward to claim, explore ad to earn reward", 'data' => $res);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No Reward Found", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to get wallet amount and respect to wallet history */


    /* start function to get wallet amount and respect to wallet history */

    function get__post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                $user_id = $_POST['user_id']; //pr($_POST); die;
                // this code is write here to rate the .
                //$res['release_aNew Adsmount'] = $this->manufacture_mod->release_amount();
                $res['rewards'] = $this->auth_mod->get_total_rewords($user_id);
                $res['ads_list'] = $this->auth_mod->get_rewords_list($user_id, $_POST['page'], $_POST['per_page']);
                //    pr($res); die; //http://182.76.237.227/~apitest
                if (@$res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Wallet amount get successfully", 'data' => $res);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No Wallet Found", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to get wallet amount and respect to wallet history */

    /*     * ************************start function of plan related*********************************** */

    public function list_plan_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', 'User id', 'trim|required');
        if ($this->form_validation->run() === true) {

            $data = $this->auth_mod->list_plan();
            if ($data['status'] == 'success') {
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseStatus' => $data['msg'], 'data' => $data['result']);
                $this->response($success);
            } else {
                $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $data['msg'], 'data' => null);
                $this->response($error);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function subscribe_plan_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', 'User id', 'trim|required');
        $this->form_validation->set_rules('plan_name', 'Plan name', 'trim|required');
        $this->form_validation->set_rules('plan_id', 'Plan id', 'trim|required');
        $this->form_validation->set_rules('validity', 'Validity', 'trim|required');
//        $this->form_validation->set_rules('validity_type', 'Validity type', 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->auth_mod->subscribe_plan();
            if ($data['status'] == 'success') {
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseStatus' => 'Congrats ! Your paln is subscribe Successfully !', 'data' => null);
                $this->response($success);
            } else {
                $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Oops! Something wants worng !', 'data' => null);
                $this->response($error);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    public function check_subscription_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', 'User id', 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->auth_mod->check_subscription();
            if ($data['status'] == 'success') {
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseStatus' => $data['msg'], 'data' => $data);
                $this->response($success);
            } else {
                $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $data['msg'], 'data' => $data);
                $this->response($error);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function schedule_ads_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('start_date', "Start Date", 'trim|required');
        $this->form_validation->set_rules('end_time', "Start Time", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
                $res = $this->auth_mod->schedule_ads();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function refer_link_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('referal_link', 'Referal link', 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to call refeal link add.
                $res = $this->auth_mod->refer_link();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function claim_rewords_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('ads_id', "ADs id", 'trim|required');
        $this->form_validation->set_rules('reword_id', "Reward ID", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                //pr($_POST); die;
                // this code is write here to rate the .
                $res = $this->auth_mod->claim_rewords();


                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function update_claim_rewords_status_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('rewords_ids', "Rewords ids", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to call refeal link add.
                $res = $this->auth_mod->update_claim_rewords();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* start function to add ticket */

    function add_ticket_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('complaint_type', "Complaint type", 'trim|required');
        $this->form_validation->set_rules('description', "Description", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            //  pr($data); die;
            if ($data['responcCode'] == '200') {
                //pr($_POST); die;
                // this code is write here to call the add ticket.
                $res = $this->auth_mod->add_ticket();
                // pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to add ticket */


    /* start function to get general setting */

    function get_ticket_list_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $user_id = $this->input->post('user_id');
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the forgot password.
                $res = $this->auth_mod->get_ticket_list($user_id);
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to get general setting */



    /* start function to chat customer support */

    function reply_chat_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('ticket_id', "Complaint type", 'trim|required');
        $this->form_validation->set_rules('content', "Description", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                //pr($_POST); die;
                // this code is write here to call the forgot password.
                $res = $this->auth_mod->reply_chat();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to add Customer support */



    /* start function to get ticket details */

    function get_ticket_details_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('ticket_id', "Ticket id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $ticket_id = $this->input->post('ticket_id');
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {

                // this code is write here to call the forgot password.
                $res = $this->auth_mod->get_ticket_details($ticket_id);
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to get ticket details */


    /* start function to add feedback like and dislike */

    function like_dislike_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('ads_id', "Ads id", 'trim|required');
        $this->form_validation->set_rules('like_dislike', "Like Dislike", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
                //pr($_POST); die;
                $res = $this->auth_mod->like_dislike();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to add feedback feedback like and dislike */

    /* start function to add feedback like and dislike */

    function comment_ads_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('ads_id', "Ads id", 'trim|required');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('comment', "Comment", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
                //pr($_POST); die;
                $res = $this->auth_mod->comment_ads();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => $res['result']);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    /* end function to add feedback feedback like and dislike */

    function re_schedule_ads_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('start_date', "Start Date", 'trim|required');
        $this->form_validation->set_rules('end_time', "Start Time", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
                //pr($_POST); die;
                $res = $this->auth_mod->re_schedule_ads();
                //pr($res); die;
                if (@$res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function ads_view_time_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('ads_id', "Ads ID", 'trim|required');
        $this->form_validation->set_rules('view_time', "View Time", 'trim|required');
        $postData = $this->input->post();

        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
                //pr($_POST); die;

                $view_time = !empty($postData['view_time']) ? $postData['view_time'] : '';
                $ads_group_id = !empty($postData['ads_group_id']) ? $postData['ads_group_id'] : '';
                $city_id = !empty($postData['city_id']) ? $postData['city_id'] : '';
                $ads_id = !empty($postData['ads_id']) ? $postData['ads_id'] : '';
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';

                $updataArray['view_time'] = $view_time;
                $updataArray['user_id'] = $user_id;
                $updataArray['ads_id'] = $ads_id;

                if (!empty($ads_group_id)) {
                    $updataArray['ads_group_id'] = $ads_group_id;
                }
                if (!empty($city_id)) {
                    $updataArray['city_id'] = $city_id;
                }

                $updataArray['created_date'] = date('Y-m-d H:i:s');

//                $this->db->where('ads_id', $ads_id);
//                $this->db->where('user_id', $user_id);
                //check record
                $sql = "select id from tbl_view_ads where ads_id = $ads_id and user_id = $user_id";
                $dd = $this->db->query($sql)->row();

                if (!empty($dd->id)) {
                    $sql22 = "update tbl_view_ads set view_time = view_time + $view_time where ads_id= $ads_id and user_id = $user_id";
                    $res = $this->db->query($sql22);
                } else {
                    $res = $this->db->insert('tbl_view_ads', $updataArray);
                }


                //pr($res); die;
                if (!empty($res)) {
                    $update = "update tbl_ads set total_views = total_views + 1 where id = $ads_id";
                    $this->db->query($update);

                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Ads time updated successfully', 'data' => null);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Something went wrong', 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function send_otp_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('otp', "OTP", 'trim|required');
        $this->form_validation->set_rules('mobile_number', "Mobile Number", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            $postData = $this->input->post();
            $mobile_number = !empty($postData['mobile_number']) ? $postData['mobile_number'] : '';
            $otp = !empty($postData['otp']) ? $postData['otp'] : '';

//            $send = $this->send_sms($mobile_number, $otp);
            $send = $this->send_ewallet_sms($mobile_number, $otp);

            //pr($res['result']['token']="abc"); die;
            if ($send['status'] == 'success') {
                $outputData = array('otp' => $otp);
                $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'OTP sent successfully.', 'data' => $outputData);
                $this->response($success);
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $send['message'], 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function send_sms($mobile = null, $otp = null) {

        if (!empty($mobile)) {

            $from = 'Ringmoney';
            $messageId = 'RM' . rand(10000, 99999);
            $text = 'Ringmoney Verification Code is - ' . $otp;
            $notifyUrl = '';
            $notifyContentType = 'application/json';
            $callbackData = 'Ringmoney OTP';
            $username = 'MakAdmin';
            $password = 'Wx@!j3WcQ#?';

            $postUrl = "https://api.infobip.com/sms/1/text/advanced";

            // creating an object for sending SMS
            $destination = array("messageId" => $messageId,
                "to" => trim($mobile));

            $message = array("from" => $from,
                "destinations" => array($destination),
                "text" => $text,
                "notifyUrl" => $notifyUrl,
                "notifyContentType" => $notifyContentType,
                "callbackData" => $callbackData);

            $postData = array("messages" => array($message));
            $postDataJson = json_encode($postData);

            $ch = curl_init();
            $header = array("Content-Type:application/json", "Accept:application/json");

            curl_setopt($ch, CURLOPT_URL, $postUrl);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($ch, CURLOPT_USERPWD, $username . ":" . $password);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 2);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postDataJson);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            // response of the POST request
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $responseBody = json_decode($response);
            curl_close($ch);
            if ($httpCode >= 200 && $httpCode < 300) {
                $messages = $responseBody->messages;

                $to = $messages[0]->to;
                $messageId = $messages[0]->messageId;
                $description = $messages[0]->status->description;
                $smsCount = $messages[0]->smsCount;

                $sms_log = array(
                    'message_id' => $messageId,
                    'text' => $text,
                    'description' => $description,
                    'status' => 1,
                    'phone_number' => $to,
                    'sms_count' => $smsCount
                );

                $res = $this->sms_log_model->insert($sms_log);

                if ($res) {
                    return $sms_log;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    function send_ewallet_sms($mobile = null, $otp = null) {
        $output = array();
        if (!empty($mobile)) {
            $requestURL = "http://bulksmstz.com/API/V1/";
            $text = "Hi,OTP is $otp for access your ringmoney account. Team Ringmoney";

            $postData = array(
                'username' => SMS_USERNAME,
                'password' => SMS_PASSWORD,
                'request' => 'send',
                'recipients' => array(trim($mobile)),
                'sms' => $text,
                'sender' => SMS_SENDER
            );

            $postData = json_encode($postData);

            $opts = array(
                'http' => array(
                    'method' => 'POST',
                    'header' => 'Content-Type: application/json' . "\r\n"
                    . 'Content-Length: ' . strlen($postData) . "\r\n",
                    'content' => $postData,
                ),
            );
            $context = stream_context_create($opts);

            $result = file_get_contents($requestURL, false, $context);

            $response = json_decode($result);
            if (!empty($response) && $response->success == 1) {
                $output['status'] = 'success';
                $output['message'] = 'Your SMS has been successfully queued';
                $output['error'] = '';
            } else {
                $output['status'] = 'fail';
                $output['message'] = $response->success;
                $output['error'] = $response->success;
            }

            return $output;
        }
    }

    function clear_notification_post() {

        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                $user_id = $_POST['user_id'];
                // this code is write here to call the resend otp here.
                $res = $this->auth_mod->clear_notification($user_id);

                if ($res['status'] == 'success') {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $res['msg'], 'data' => NULL);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $res['msg'], 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function watched_history_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $postData = $this->input->post();

        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';

                $sql = "select tbl_ads.*,tbl_view_ads.id as view_id,tbl_view_ads.view_time from tbl_view_ads join tbl_ads ON tbl_ads.id = tbl_view_ads.ads_id where tbl_view_ads.user_id = $user_id and tbl_view_ads.is_view_ads = '1' order by tbl_view_ads.created_date desc";
                $result = $this->db->query($sql)->result();
                if (!empty($result)) {
                    foreach ($result as $key => $val) {

                        $islike = $this->db->select('id')->where('user_id', $user_id)->where('ads_id', $val->id)->get('tbl_like');


                        if (@$islike->num_rows() > 0) {
                            $result[$key]->isLike = '1';
                        } else {
                            $result[$key]->isLike = '0';
                        }


                        if (!empty($val->advert_profile_image)) {
                            $result[$key]->advert_profile_image = ADVERTISMENT_URL . 'uploads/user_image/' . $val->advert_profile_image;
                        } else {
                            $result[$key]->advert_profile_image = '';
                        }

                        if (!empty($val->ads_file)) {
                            $result[$key]->ads_file = ADVERTISMENT_URL . 'uploads/ads/' . $val->ads_file;
                        } else {
                            $result[$key]->ads_file = '';
                        }

                        if ($val->thumbnail != '') {
                            $result[$key]->thumbnail = ADVERTISMENT_URL . 'uploads/ads/' . $val->thumbnail;
                        } else {
                            $result[$key]->thumbnail = ADVERTISMENT_URL . '/uploads/ads/thumb.png';
                        }
                    }
                }


                //pr($res); die;
                if (!empty($result)) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => 'Success', 'data' => $result);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Data not found', 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function claim_history_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('type', "Type", 'trim|required');
        $postData = $this->input->post();

        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';
                $type = !empty($postData['type']) ? $postData['type'] : '1';

                $res['history'] = $this->auth_mod->view_claim_history($user_id, $type);
                if ($res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $res);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No data Found", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    //mpesa check register phone number or short code

    function check_mpesa_account_post() {

        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('phone_number', "Phone number", 'trim|required');
        $postData = $this->input->post();

        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $phone_number = !empty($postData['phone_number']) ? $postData['phone_number'] : '';

                $response = $this->mpesa->C2B_REGISTER('Completed', $phone_number);

                if ($response->ResponseDescription == 'success' && !empty($response->ResponseDescription)) {
                    $success = array('responseCode' => '200', 'exception' => $response->ResponseDescription, 'responseStatus' => 'success', 'responseMessage' => "Account exist", 'data' => NULL);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Your number is not registered with mpesa database.', 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function ewallet_withdrawal_post() {

        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('phone_number', "Phone number", 'trim|required');
        $this->form_validation->set_rules('amount', "Amount", 'trim|required');
        $this->form_validation->set_rules('user_id', "User Id", 'trim|required');
        $postData = $this->input->post();

        $output = NULL;
        $amount = 0;
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $phone_number = !empty($postData['phone_number']) ? $postData['phone_number'] : '';

                $points = !empty($postData['amount']) ? $postData['amount'] : '';

                $this->db->select('id,reword_rate');
                $res = $this->db->get('tbl_reword_rate')->row();

                if (!empty($res->reword_rate)) {
                    $amount = round($points / $res->reword_rate);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Reward convertion issues from admin side plese set coversion rate.', 'data' => null);
                    $this->response($success);
                    return;
                }

                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';

                $CommandID = 'BusinessPayment';
                $remarks = 'Transfer reward money';

//                $response = $this->mpesa->B2C($CommandID, $amount, $remarks, $ocassion, $phone_number);
                $payement_id = $this->auth_mod->b2c_request($amount, $phone_number, $remarks, $user_id);

                if ($payement_id) {
                    
                    $sqltt = "UPDATE tbl_users SET wallet_total_amount = wallet_total_amount - $points WHERE id = '".$user_id."'";
                    $this->db->query($sqltt);
                    
                    $paymentData = $this->mpeasa_payment_model->get($payement_id);

                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $paymentData);
                    $this->response($success);
                    
                } else {

                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Request not generated something went wrong', 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function ewallet_transfer_history_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $postData = $this->input->post();

        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';

                $res = $this->mpeasa_payment_model->where('user_id', $user_id)->get_all();

                if (!empty($res)) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $res);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No data Found", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function user_setting_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');
        $this->form_validation->set_rules('type', "Type", 'trim|required');
        $this->form_validation->set_rules('status', "Status", 'trim|required');

        $postData = $this->input->post();
//        pr($postData);die;
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .    
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';
                $type = !empty($postData['type']) ? $postData['type'] : '';
                $status = $postData['status'];

                if ($type == 'comment') {
                    $update_array = array('show_comment' => $status);
                } elseif ($type == 'incoming_call_notification') {
                    $update_array = array('incoming_call_notification' => $status);
                } else {
                    $update_array = array('show_notification' => $status);
                }

//                pr($update_array);die;

                $res = $this->user_model->update($update_array, $user_id);
//                echo $this->db->last_query();die;

                if ($res) {
                    $user_data = $this->user_model->where('id', $user_id)->get();
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Setting updated successfully", 'data' => $user_data);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Something went wrong", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function group_list_get() {
        header('Access-Control-Allow-Origin: *');


        $sql = "select id,name from tbl_ads_group";
        $result = $this->db->query($sql)->result();

        if ($result) {
            $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Setting updated successfully", 'data' => $result);
            $this->response($success);
        } else {
            $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No data found", 'data' => null);
            $this->response($success);
        }
    }

    function country_list_get() {
        header('Access-Control-Allow-Origin: *');

        $sql = "select id,name from countries";
        $result = $this->db->query($sql)->result();

        if ($result) {
            $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $result);
            $this->response($success);
        } else {
            $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No data found", 'data' => null);
            $this->response($success);
        }
    }

    function state_list_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('country_id', "Country Id", 'trim|required');

        $postData = $this->input->post();
//        pr($postData);die;
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .    
//                pr($postData); die;
                $country_id = !empty($postData['country_id']) ? $postData['country_id'] : '';

                $sql = "select id,name from states where country_id = $country_id";
                $result = $this->db->query($sql)->result();

                if ($result) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $result);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Something went wrong", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function city_list_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('state_id', "Type", 'trim|required');

        $postData = $this->input->post();
//        pr($postData);die;
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .    
//                pr($postData); die;
                $state_id = !empty($postData['state_id']) ? $postData['state_id'] : '';

                $sql = "select id,name from cities where state_id = $state_id";
                $result = $this->db->query($sql)->result();

                if ($result) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "City List Found", 'data' => $result);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Something went wrong", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function check_signup_users_get() {
        header('Access-Control-Allow-Origin: *');

        $sql = "select signup_limit from global_settings";
        $result = $this->db->query($sql)->row();

        $sql2 = "select count(*) as total_user from tbl_users where status = 'active' and user_type='3'";
        $result2 = $this->db->query($sql2)->row();

        if (!empty($result->signup_limit)) {
            $output['signup_limit'] = $result->signup_limit;
        } else {
            $output['signup_limit'] = NULL;
        }

        if (!empty($result2->total_user)) {
            $output['total_user'] = $result2->total_user;
        } else {
            $output['total_user'] = 0;
        }

        if ($result2->total_user >= $result->signup_limit) {
            $output['exceed'] = 1;
        } else {
            $output['exceed'] = 0;
        }

        if ($output) {
            $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Setting updated successfully", 'data' => $output);
            $this->response($success);
        } else {
            $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No data found", 'data' => NULL);
            $this->response($success);
        }
    }

    function get_user_setting_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');

        $postData = $this->input->post();
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';
                $res = $this->user_model->fields('show_comment,show_notification,mobile_number,incoming_call_notification,current_package')->where('id', $user_id)->get();

                //check mpesa account
                $phone_number = !empty($res->mobile_number) ? $res->mobile_number : '';
                $current_package = !empty($res->current_package) ? $res->current_package : '';

//                $response = $this->mpesa->C2B_REGISTER('Completed', $phone_number);
//
//                if ($response->ResponseDescription == 'success' && !empty($response->ResponseDescription)) {
//                    $res->is_connected = '1';
//                } else {
//                    $res->is_connected = '0';
//                }
                
                $res->is_connected = '1';

                if (!empty($current_package)) {
                    $res->is_subscribed = '1';
                } else {
                    $res->is_subscribed = '0';
                }

                if ($res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $res);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Something went wrong", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function my_current_plan_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');

        $postData = $this->input->post();
        if ($this->form_validation->run() === true) {

            $data = $this->verify_request();


            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';

                $sql = "select tbl_subscription_request.*,tbl_users.current_package from tbl_users inner join tbl_subscription_request ON tbl_subscription_request.plan_id = tbl_users.current_package where tbl_users.id = $user_id and tbl_subscription_request.user_id = $user_id order by tbl_subscription_request.id desc";
                $my_plan = $this->db->query($sql)->row();

                if (!empty($my_plan)) {

                    if ($my_plan->payment_status == '0') {
                        $msg = 'Your payment is under process for now.';
                    } else {
                        $msg = 'Your payment successfully approved.';
                    }

                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => $msg, 'data' => $my_plan);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Currently You don't have any active package", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function check_ads_on_incoming_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');

        $postData = $this->input->post();
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';
                $res = $this->user_model->fields('incoming_call_notification,id,user_name,email,device_id,device_token')->where('id', $user_id)->get();

                //check mpesa account
                $incoming_call_notification = !empty($res->incoming_call_notification) ? $res->incoming_call_notification : '';
                $to_id = !empty($res->id) ? $res->id : '';
                $device_id1 = !empty($res->device_token) ? $res->device_token : '';
                $user_mobile_info = array('user_mobile_token' => $device_id1);


                $sender_id = 'admin';
                $payload = $this->create_payload_json($message, $title);
                $notification_type = 'pending_watching_ads';

                if ($incoming_call_notification) {

                    $sql = "SELECT * FROM tbl_ads where status = '2' and id NOT IN (SELECT ads_id  FROM tbl_view_ads where user_id = $user_id)";

                    $approved_ads = $this->db->query($sql)->result();


                    if (!empty($approved_ads)) {

                        $total_ads = count($approved_ads);

                        $title = 'New ' . $total_ads . ' ads are available to watch. You can check them out after call to earn more rewards.';

                        $message = 'New ' . $total_ads . ' ads are available to watch. You can check them out after call to earn more rewards.';

                        $res = $this->auth_mod->push_user_approved_notification($user_mobile_info, $payload, $sender_id, $to_id, $notification_type, $title);
                        if ($res) {
                            $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Message sent successfully", 'data' => $res);
                            $this->response($success);
                        } else {
                            $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Message not sent", 'data' => null);
                            $this->response($success);
                        }
                    } else {
                        $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No new ads found", 'data' => null);
                        $this->response($success);
                    }
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Incoming notification is disable", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function make_payment_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User ID", 'trim|required');
        $this->form_validation->set_rules('amount', "Amount", 'trim|required');
        $this->form_validation->set_rules('plan_id', "Plan ID", 'trim|required');
        $output = array();
        $postData = $this->input->post();
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';
                $amount = !empty($postData['amount']) ? $postData['amount'] : '';
                $plan_id = !empty($postData['plan_id']) ? $postData['plan_id'] : '';

                $payment_url = base_url() . 'dpo_payment/index.php?user_id=' . $user_id . '&amount=' . $amount . '&plan_id=' . $plan_id;
                $cancel_url = base_url() . 'dpo_payment/back.php';
                $success = base_url() . 'dpo_payment/success.php';

                if (!empty($payment_url)) {

                    $output = array(
                        'payment_url' => $payment_url,
                        'cancel_url' => $cancel_url,
                        'success_url' => $success
                    );


                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $output);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Currently You don't have any active package", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function make_ewallet_payment_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User ID", 'trim|required');
        $this->form_validation->set_rules('amount', "Amount", 'trim|required');
        $this->form_validation->set_rules('plan_id', "Plan ID", 'trim|required');
        $output = array();
        $postData = $this->input->post();
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();
            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';

                $sql = "select mobile_number from tbl_users where id = $user_id";
                $userData = $this->db->query($sql)->row();

                $phone = !empty($userData->mobile_number) ? $userData->mobile_number : '255718811173';

                $amount = !empty($postData['amount']) ? $postData['amount'] : '';
                $plan_id = !empty($postData['plan_id']) ? $postData['plan_id'] : '';
                $reference_number = payment_referecne_number();


                $payement = $this->ewallet_payment($amount, $reference_number, $phone);

                if (!$payement) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'error', 'responseMessage' => "Payment request not generated ewallet account something went wrong", 'data' => NULL);
                    $this->response($success);
                }

                $paymentArray = array(
                    'user_id' => $user_id,
                    'amount' => $amount,
                    'reference_number' => $reference_number,
                    'remark' => 'Payment for ringmoney subscription',
                    'type' => 'subscription',
                    'plan_id' => $plan_id,
                );

                $last_id = $this->customer_payment_model->insert($paymentArray);
                
                if ($last_id) {

                    $updatePackage = array('current_package' => $plan_id);

                    $this->db->where('id', $user_id);
                    $this->db->update('tbl_users', $updatePackage);

                    $paymentData = $this->customer_payment_model->get($last_id);

                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Payment request generated successfully", 'data' => $paymentData);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Something went wrong data not recorded", 'data' => NULL);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function ewallet_payment($amount = null, $reference_number = null, $phone = null) {

        $spId = THIRD_PARTY_NUMBER;
        $reference = $reference_number;

        $payment_key = $spId . $reference . $amount;

        $sha256 = hash('sha256', $payment_key);
        $key = base64_encode(strtoupper($sha256));

        $url = "http://155.12.30.18:7918/epg/MiddleWarePush?spId=$spId&key=$key&msisdn=255713076547&amount=$amount&reference=$reference";
//        echo $url;die;

        $res = file_get_contents($url);

        $response = json_decode($res);
//        pr($response);die;

        if (!empty($response) && $response->ErrorCode == 200) {
            return true;
        } else {
            return false;
        }
    }

    function application_version_get() {
        header('Access-Control-Allow-Origin: *');

        $sql = "select anroid_version,ios_version from global_settings";
        $result = $this->db->query($sql)->row();

        if ($result) {
            $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Success", 'data' => $result);
            $this->response($success);
        } else {
            $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "No data found", 'data' => null);
            $this->response($success);
        }
    }

    function remove_group_post() {
        header('Access-Control-Allow-Origin: *');
        $this->form_validation->set_rules('user_id', "User id", 'trim|required');

        $postData = $this->input->post();
        if ($this->form_validation->run() === true) {
            $data = $this->verify_request();

            if ($data['responcCode'] == '200') {
                // this code is write here to rate the .
//                pr($postData); die;
                $user_id = !empty($postData['user_id']) ? $postData['user_id'] : '';

                $update = array(
                    'group_id' => NULL
                );

                $this->db->where('id', $user_id);
                $res = $this->db->update('tbl_users', $update);

//                echo $this->db->last_query();die;

                if ($res) {
                    $success = array('responseCode' => '200', 'responseStatus' => 'success', 'responseMessage' => "Setting update successfully", 'data' => NULL);
                    $this->response($success);
                } else {
                    $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => "Something went wrong", 'data' => null);
                    $this->response($success);
                }
            } else {
                $success = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => 'Unauthorized Access!', 'data' => null);
                $this->response($success);
            }
        } else {
            $error_msg = validation_errors();
            $error = array('responseCode' => '400', 'responseStatus' => 'error', 'responseMessage' => $error_msg, 'data' => null);
            $this->response($error);
        }
    }

    function create_payload_json($message, $title) {
        $badge = "0";
        $sound = 'default';
        $payload = array();
        $payload['aps'] = array('message' => $message, 'title' => $title, 'badge' => intval($badge), 'sound' => $sound);
        return json_encode($payload);
    }

}
